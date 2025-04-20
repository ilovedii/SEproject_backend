import {DATABASE, AUTH} from './config.js';
import {rl, terminal} from './terminal.js';

function checkPassword(password){
	const isUpper = /[A-Z]/.test(password);
	const isLower = /[a-z]/.test(password);
	const isNumber = /[0-9]/.test(password);
    const enoughLength = password.length >= 8;

	return isUpper && isLower && isNumber && enoughLength;
}

async function deleteUser(){
	const uid = await terminal("Enter user_id to delete: ");
	try{
		await DATABASE.collection('users').doc(uid).delete();
		await AUTH.deleteUser(uid);
		console.log(`${uid} has been deleted.`);
	} 
	catch (error) {
		console.error(`Fail to delete ${uid}: ${error.message}`);
	}
}

async function storeUser(){
	const email = await terminal('Email: ');
	const password = await terminal('Password: ');
	
	if(!checkPassword(password)){
		console.log("Invalid password");
		rl.close()
		return;
	}
	
	try {
		// create account
		const user = await AUTH.createUser({email,password});

		const name = await terminal("Please enter your username: ");
    	const bio = await terminal("Please enter your bio: ");
		const url = await terminal("Please enter your url: ")
		await DATABASE.collection('users').doc(user.uid).set({
			username: name,
			email: user.email,
			bio: bio,
			profile_img: null,
			url: url
		});

		console.log('User successfully added');
	}
	catch(error){
		console.error('Invalid User', error.message);
	}
	finally{
		rl.close();
	}
}
async function updateUser(){
	const uid = await terminal("Enter user_id to update: ");
	
	if (uid.trim() === "") {
		console.log("User ID cannot be empty.");
		rl.close();
		return;
	}
	
	//防呆
	const userDoc = await DATABASE.collection('users').doc(uid).get();
	if (!userDoc.exists) {
		console.log(`User with ID "${uid}" does not exist.`);
		rl.close();
		return;
	}

	const newName = await terminal("New name (leave blank to skip): ");
	const newBio = await terminal("New bio (leave blank to skip): ");
	const newUrl = await terminal("New profile URL (leave blank to skip): ");

	let updateData = {};
	if (newName.trim() !== "") updateData.username = newName;
	if (newBio.trim() !== "") updateData.bio = newBio;
	if (newUrl.trim() !== "") updateData.url = newUrl;

	if (Object.keys(updateData).length === 0) {
	console.log("No update data provided.");
	rl.close();
	return;
}


	try{
		await DATABASE.collection('users').doc(uid).update(updateData);
		console.log(`User updated.`)
		rl.close();
	} catch(err) {
		console.error("Updated faild: ",err.message);
		rl.close();
	}

}

const args = process.argv.slice(2);
if (args[0] === "create") {
	storeUser();
} else if (args[0] === "delete") {
	deleteUser();
} else if (args[0] === "update") {
	updateUser();
} else {
	console.log("請改成輸入: node User.js [create|delete|update]");
	rl.close();
}

