import {DATABASE} from './config';
//只用來放team 的 function
import { FieldValue } from 'firebase-admin/firestore';//record time
import { v4 as uuidv4 } from 'uuid';// team_id
//類別
//問號代表可以不填
export interface TeamData {
	team_name: string;
	owner_id: string;
	description?: string;
	team_size?: number;
	team_status?: 'active' | 'inactive';
	team_pf_url?: string;
}

export interface UpdateTeamInput {
	team_name?: string;
	description?: string;
	team_size?: number;
	team_status?: 'active' | 'inactive';
	team_pf_url?: string;
	owner_id?: string;
}

export interface Team {
	team_id: string;
	team_name: string;
	description: string;
	owner_id: string;
	team_status: string;
	team_pf_url: string;
	created_at: string;
}


export const TeamService = {

	//Create
	//Promise 是 return 要回傳的格式
	async createTeam(data: TeamData): Promise<{ message: string; team_id: string }> {
		if (!data.team_name || !data.owner_id) {
			throw new Error("team_name and owner_id must not be empty.");
		}

		const userDoc = await DATABASE.collection('users').doc(data.owner_id).get();
		if (!userDoc.exists) {
			throw new Error(`User "${data.owner_id}" not found.`);
		}

		const team_id = uuidv4();
		const teamIndex = DATABASE.collection("teams").doc(team_id);

		const teamData = {
			team_id,
			team_name: data.team_name,
			owner_id: data.owner_id,
			description: data.description || "",
			team_size: data.team_size || 0,
			team_status: data.team_status || "active",
			team_pf_url: data.team_pf_url || "",
			created_at: FieldValue.serverTimestamp(),
		};

		await teamIndex.set(teamData);
		return { message: "Team created", team_id };
	},

	//Delete
	async deleteTeam(team_id: string): Promise<{ message: string }> {
		const teamRef = DATABASE.collection('teams').doc(team_id);
		const doc = await teamRef.get();
		if (!doc.exists) throw new Error(`Team "${team_id}" not found.`);

		await teamRef.delete();
		return { message: `Team: ${team_id} deleted.` };
	},

	//Read
	async queryTeamByName(team_name: string): Promise<{ teams: Team[] }> {
		const snapshot = await DATABASE.collection('teams')
			.where('team_name', '==', team_name)
			.get();

		if (snapshot.empty) return { teams: [] };

		const teams = snapshot.docs.map(doc => {
			const data = doc.data();
			return {
				team_id: data.team_id,
				team_name: data.team_name,
				description: data.description,
				owner_id: data.owner_id,
				team_status: data.team_status,
				team_pf_url: data.team_pf_url,
				created_at: data.created_at?.toDate().toISOString().split('T')[0] || '(unknown)',
			};
		});
		return { teams };
	},

	async queryTeamByStatus(status: string): Promise<{ teams: Team[] }> {
		const snapshot = await DATABASE.collection('teams')
			.where('team_status', '==', status.toLowerCase())
			.get();

		if (snapshot.empty) return { teams: [] };

		const teams = snapshot.docs.map(doc => {
			const data = doc.data();
			return {
				team_id: data.team_id,
				team_name: data.team_name,
				description: data.description,
				owner_id: data.owner_id,
				team_status: data.team_status,
				team_pf_url: data.team_pf_url,
				created_at: data.created_at?.toDate().toISOString().split('T')[0] || '(unknown)',
			};
		});
		return { teams };
	},
	// async queryTeam(team_name: string): Promise<{ teams: Team[] }> {
	// 	const teamIndex = await DATABASE.collection('teams')
	// 	//.where(欄位名稱, 比較運算子, 要比的值)
	// 	//.set() 存入值
	// 	//.get() 取值
	// 	.where('team_name', '==', team_name)
	// 	.get();

	// 	if (teamIndex.empty) return { teams: [] };

	// 	const teams = teamIndex.docs.map(doc => {
	// 		//map()：對陣列裡的每一個元素做轉換
	// 		const data = doc.data();
	// 		return { //不是真的回傳值 只是map的語法
	// 			team_id: data.team_id,
	// 			team_name: data.team_name,
	// 			description: data.description,
	// 			owner_id: data.owner_id,
	// 			team_status: data.team_status,
	// 			team_pf_url: data.team_pf_url,
	// 			created_at: data.created_at?.toDate().toISOString().split('T')[0] || '(unknown)'
	// 		};
	// 	});

	// 	return { teams };
	// },
	
	//Update
	//updateData包含欄位與值
	async updateTeam(team_id: string, updateData: UpdateTeamInput): Promise<{ message: string }> {
		const teamRef = DATABASE.collection('teams').doc(team_id);
		const doc = await teamRef.get();
		if (!doc.exists) throw new Error(`Team ${team_id} not found.`);

		const allowedFields = ['team_name', 'description', 'team_size', 'team_status', 'team_pf_url', 'owner_id'];
		const filteredData: Partial<UpdateTeamInput> = {};

		for (const key of allowedFields) {
			if (key in updateData) {
				(filteredData as any)[key] = updateData[key as keyof UpdateTeamInput];
			}
		}

		if (Object.keys(filteredData).length === 0) {
			throw new Error('No valid fields to update.');
		}

		await teamRef.update(filteredData);
		return { message: `Team ${team_id} updated.` };
	},
	// async updateTeam(team_id: string, updateData: UpdateTeamInput): Promise<{message: string}> {
	// 	const teamIndex = DATABASE.collection('teams').doc(team_id);
	// 	const doc = await teamIndex.get();
	// 	if (!doc.exists) throw new Error(`Team ${team_id} not found.`);

	// 	//只有這樣的型式會被接收
	// 	const allowedFields = ['team_name', 'description', 'team_size', 'team_status', 'team_pf_url', 'owner_id'];
	// 	const filteredData: Partial<UpdateTeamInput> = {};
	// 	//欄位過濾器(?) 再研究一下
	// 	for (const key of allowedFields) {
	// 		if (key in updateData) {
	// 			(filteredData as any)[key] = updateData[key as keyof UpdateTeamInput];
	// 		}
	// 	}

	// 	if (Object.keys(filteredData).length === 0) {
	// 		throw new Error('No valid fields to update.');
	// 	}

	// 	await teamIndex.update(filteredData);
	// 	return { message: `Team ${team_id} updated.` };
	// }
}





