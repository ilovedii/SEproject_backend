//前端範例：
/*
const response = await fetch("/api/team/create", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		team_name: 阿罵哩底隊,
		owner_id: MmCuC4mOoAY2H3KKfI2V6YhrDkd2,
		description: "阿罵你怎麼沒感覺:(",
		team_size: 5,
		team_status: "active",
		team_pf_url: "https://example.com/grandma.jpg",
	}),
}
*/
import type {NextApiRequest, NextApiResponse} from "next";
import {TeamService} from '../../firebase/TeamService';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
	if (req.method !== 'POST') return res.status(400).json({error: `Only POST allowed.`}); //要確認status code有沒有錯

	try{
		const data = req.body;
		const result = await TeamService.createTeam(data);
		return res.status(200).json(result);
	} catch(err) {
		return res.status(500).json({ error: err.message || "Create failed" });
	}
}
