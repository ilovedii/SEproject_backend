import {DATABASE} from './config.js';
import {rl, terminal} from './terminal.js';

import { FieldValue } from 'firebase-admin/firestore';// 我再研究一下差別
import { v4 as uuidv4 } from 'uuid';

//Create
async function createTeam(){
	//teamid 是 uuid
	const team_id = uuidv4();
	//時間是用fieldvalue
	const owner_id = await terminal('owner id: ');
	const team_name = await terminal('team name: ');
	const description = await terminal("team description: ");
	const status_id = await terminal("status id: ");
	const created_at = FieldValue.serverTimestamp();

	try {
		await DATABASE.collection('teams').doc(team_id).set({
			owner_id,
			team_name,
			description,
			status_id,
			created_at,
			team_pf_url: ""
		});
		console.log(`Team: ${team_name} is created.`);
	} catch(err){
		console.error(`Failed to creat Team: ${team_name}`, err.message);
	} finally{
		rl.close();}
}
//Delete
async function deleteTeam(){
	const team_id = await terminal("Enter team_id to delete: ");
	try {
		await DATABASE.collection('teams').doc(team_id).delete();
		console.log(`Team ${team_id} deleted.`);
	} catch (err) {
		console.error("Failed to delete Team:", err.message);
	} finally {
		rl.close();
	}
}

async function getUserId(username){
	const user_info = await DATABASE.collection('users')
		.where('username', '==', username)
		.get();

	if (user_info.empty) {
		console.log(` No user found with username "${username}".`);
		return null;
	} else {
		return user_info.docs[0].id;
	}
}

//Read(應該還要再修 看要怎麼查)
async function queryTeam(){
	const target_name = await terminal(`Enter Team name to get info: `);
	const info = await DATABASE.collection('teams')
	//.where(欄位名稱, 比較運算子, 要比的值)
	.where(`team_name`, `==`, target_name)
	.get();
	
	if(info.empty){
		console.log(`no team found with that name.`);
		rl.close();
		return;
	}else{
		info.forEach(doc => {
			const team = doc.data();
			const created_at = team.created_at?.toDate();
			const date = created_at ? created_at.toISOString().split('T')[0] : '(unknown)';

			console.log(`Team name: ${target_name}`);
			console.log(`Description: ${team.description}`);
			console.log(`Owner ID: ${team.owner_id}`);
			console.log(`Status ID: ${team.status_id}`);
			console.log(`Created At: ${date}`);
			console.log(`Profile URL: ${team.team_pf_url}`);
		});
		rl.close();
	}
}

//我先寫改全部，條件等等再說
//Update
async function updateTeam() {
	const team_id = await terminal("Enter team ID to update: ");
	if (team_id.trim() === "") {
		console.log("Team ID cannot be empty.");
		rl.close();
		return;
	}
	//防呆team
	const teamDoc = await DATABASE.collection('teams').doc(team_id).get();
	if (!teamDoc.exists) {
		console.log(`Team with ID "${team_id}" does not exist.`);
		rl.close();
		return;
	}

	const newDesc = await terminal("New description(leave blank to skip): ");
	const newName = await terminal("New Name(leave blank to skip): ");
	const newOwnerName = await terminal('New owner(leave blank to skip): ');
	const newUrl = await terminal('New Url(leave blank to skip): ');
	
	let updateData = {};
	if (newName.trim() !== "") updateData.team_name = newName;
	if (newDesc.trim() !== "") updateData.description = newDesc;
	if (newUrl.trim() !== "") updateData.team_pf_url = newUrl;

	//防呆user
	if (newOwnerName.trim() !== ""){
		const newOwnerId = await getUserId(newOwnerName);
		if (!newOwnerId) {
			console.log("Invalid ownerName.");
			rl.close();
			return;
		}
		updateData.owner_id = newOwnerId
	}

	try {
		await DATABASE.collection('teams').doc(team_id).update(updateData);
		console.log("Team updated.");
	} catch (err) {
		console.error("Update failed:", err.message);
	}
	rl.close();
}

const args = process.argv.slice(2);
if (args[0] === "create") {
	createTeam();
} else if (args[0] === "delete") {
	deleteTeam();
} else if (args[0] === "query") {
	queryTeam();
} else if (args[0] === "update") {
	updateTeam();
} else {
	console.log("請改成輸入: node Team.js [create|delete|query|update]");
	rl.close();
}

