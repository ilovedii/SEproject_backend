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
	//const status_id = await terminal("status id: ");
	const created_at = FieldValue.serverTimestamp();
	let team_status = "";
	//team_status: active 或 inactive
	while (true) {
		team_status = (await terminal("Enter team status (active/inactive): ")).trim().toLowerCase();
		if (team_status === "active" || team_status === "inactive") {
			break;
		} else {
			console.log("Invalid status. Please enter 'active' or 'inactive'.");
		}
	}
	try {
		await DATABASE.collection('teams').doc(team_id).set({
			owner_id,
			team_name,
			description,
			//status_id,
			team_status,
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

//Read
async function queryTeam(){
	const searchType = (await terminal("Search by name or status: ")).trim().toLowerCase();
	let info;

	if (searchType === "name") {
		const target_name = await terminal(`Enter Team name to get info: `);
		info = await DATABASE.collection('teams')
			.where(`team_name`, `==`, target_name)
			.get();
	} else if (searchType === "status") {
		const status = await terminal(`Enter team status to search: `);
		info = await DATABASE.collection('teams')
			.where(`team_status`, `==`, status)
			.get();
	} else {
		console.log("Invalid input.");
		rl.close();
		return;
	}

	
	if(info.empty){
		console.log(`No team found.`);
		rl.close();
		return;
	}else{
		info.forEach(doc => {
			const team = doc.data();
			const created_at = team.created_at?.toDate();
			const date = created_at ? created_at.toISOString().split('T')[0] : '(unknown)';

			console.log(`Team name: ${team.team_name}`);
			console.log(`Description: ${team.description}`);
			console.log(`Owner ID: ${team.owner_id}`);
			console.log(`Status: ${team.team_status}`);
			console.log(`Created At: ${date}`);
			console.log(`Profile URL: ${team.team_pf_url}`);
		});
		rl.close();
	}
}

//Update
async function updateTeam() {
	const team_id = await terminal("Enter team ID to update: ");
	if (team_id.trim() === "") {
		console.log("Team ID cannot be empty.");
		rl.close();
		return;
	}

	const teamDoc = await DATABASE.collection('teams').doc(team_id).get();
	if (!teamDoc.exists) {
		console.log(`Team with ID "${team_id}" does not exist.`);
		rl.close();
		return;
	}

	console.log("Which attribute do you want to update?");
	console.log("Options: team_name, team_size, description, team_pf_url, team_status, owner");

	const attribute = (await terminal("Enter attribute to update: ")).trim();

	let updateData = {};

	switch (attribute) {
		case 'team_name':
		case 'team_size':
		case 'description':
		case 'team_pf_url':
		case 'team_status': {
			const newValue = await terminal(`Enter new value for ${attribute}: `);
			if (newValue.trim() === "") {
				console.log("Value cannot be empty.");
				rl.close();
				return;
			}
			updateData[attribute] = (attribute === 'team_size') ? parseInt(newValue) : newValue;
			break;
		}
		case 'owner': {
			const newOwnerName = await terminal("Enter new owner name: ");
			if (newOwnerName.trim() === "") {
				console.log("Owner name cannot be empty.");
				rl.close();
				return;
			}
			const newOwnerId = await getUserId(newOwnerName);
			if (!newOwnerId) {
				console.log("Invalid owner name.");
				rl.close();
				return;
			}
			updateData.owner_id = newOwnerId;
			break;
		}
		default:
			console.log("Invalid attribute.");
			rl.close();
			return;
	}

	try {
		await DATABASE.collection('teams').doc(team_id).update(updateData);
		console.log("Team updated successfully.");
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

