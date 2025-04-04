import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import {readFileSync} from "fs";
const serviceAccount = JSON.parse(readFileSync("./accountKey.json", "utf-8"));

//先用terminal try
import readline from 'readline';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function register(query){
	return new Promise(resolve => rl.question(query, answer => resolve(answer)));
}

function info(query){
	return new Promise(resolve => rl.question(query, answer => resolve(answer)));
}


//啟動firebase SDK
initializeApp({
	credential: cert(serviceAccount), //啟動金鑰
})

const DATABASE = getFirestore();
const AUTH = getAuth();

function checkEmail(password){
	const isUpper = /[A-Z]/.test(password);
	const isLower = /[a-z]/.test(password);
	const isNumber = /[0-9]/.test(password);
    const enoughLength = password.length >= 8;

	return isUpper && isLower && isNumber && enoughLength;
}

async function storeUser(){
	const email = await register('Email: ');
	const password = await register('Password: ');
	
	if(!checkEmail(password)){
		console.log("Invalid password");
		rl.close()
		return;
	}
	
	try {
		// create account
		const user = await AUTH.createUser({email,password});

		const name = await info("Please enter your username: ");
    	const bio = await info("Please enter your bio: ");

		await DATABASE.collection('users').doc(user.uid).set({
			username: name,
			email: user.email,
			bio: bio,
			profile_img: null,
			url: ''
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

storeUser()
