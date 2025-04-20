import {createUser} from '../../firebase/UserService';

export default async function handler(req, res){
	if (req.method !== 'POST') return res.status(400).end(); //要確認status code有沒有錯
	
	try{
		const { email, name, nickname, password, bio, url, profile_pic, community_link  } = req.body;

 		if (!email || !name || !password) {
			return res.status(404).json({ error: 'email, name and password can not be empty.' });
		}

		const result = await createUser({ email, name, nickname, password, bio, url, profile_pic, community_link});
		res.status(200).json(result);
	} catch(err){
		if (err.message.includes('Password')) {
			res.status(406).json({ error: err.message });
		} else {
			res.status(500).json({ error: err.message });
		}	
	}
}
