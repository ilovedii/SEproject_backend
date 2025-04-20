import { AUTH, DATABASE } from './config.js'; // 你應該已經有 firebase admin 初始化

export interface CreateUserInput {
  	email: string;
  	name: string;
  	nickname?: string;
	password: string;
  	gender?: string;
 	//通常是給圖片連結
 	profile_pic?: string;
  	bio?: string;
  	url?: string;
  	community_link?: string;
}

function checkPassword(password: string): boolean {
  	return (
    	/[A-Z]/.test(password) &&
   		/[a-z]/.test(password) &&
    	/[0-9]/.test(password) &&
   	 	password.length >= 8
  	);
}

export async function createUser(input: CreateUserInput): Promise<{ message: string; uid: string }> {
  	const { email, name, nickname, password, bio, url, profile_pic, community_link } = input;

  if (!checkPassword(password)) {
    throw new Error("Password too weak. Must be 8+ chars with upper/lower/number.");
  }

  const user = await AUTH.createUser({ email, password });

  await DATABASE.collection("users").doc(user.uid).set({
    email,
	name,
	nickname,
    bio,
    url,
    profile_pic,
	community_link
  });

  return { message: `User created`,uid: user.uid };
}

export async function deleteUser(uid: string) {
	const userIndex = DATABASE.collection('users').doc(uid);
	const doc = await userIndex.get();
	if (!doc.exists) throw new Error(`User: "${uid}" not found.`);

	await DATABASE.collection('users').doc(uid).delete();
	await AUTH.deleteUser(uid);
	return { message: `User: ${uid} deleted.` };
}

export async function getUserInfo(uid: string){
	const userIndex = DATABASE.collection('users').doc(uid);
	const doc = await userIndex.get();
	if (!doc.exists) throw new Error(`User: "${uid}" not found.`);
	const data = doc.data();
	if (!data) throw new Error(`User: "${uid}" has no data.`);

	return {
		user_id: uid,
		name: data.name || null,
		nickname: data.nickname || null,
		email: data.email || null,
		gender: data.gender || null,
		bio: data.bio || "",
		profile_pic: data.profile_pic || null,
		community_link: data.community_link || null
	};
}


