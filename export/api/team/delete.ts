/*
const response = await fetch("/api/team/delete", {
	method: "DELETE",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ team_id: 21889404-9805-95f5-8cf3-3b04ad3a0a9d })
	}
*/
import { NextApiRequest, NextApiResponse } from 'next';
import {TeamService} from '../../firebase/TeamService';

export default async function handler(req: NextApiRequest,res: NextApiResponse){
	if (req.method != 'DELETE') return res.status(400).json({ error: "Only DELETE allowed." });

	try{
		const { team_id } = req.body;

		if (!team_id){
			return res.status(404).json({error: 'team_id can not be empty.'});
		}

		const result = await TeamService.deleteTeam(team_id);
		res.status(200).json(result);
	} catch(err) {
		if (err.message.includes('not found')) {
			res.status(404).json({ error: err.message });
		} else {
			res.status(500).json({ error: err.message });
		}	
	}
} 
