//一些終端輸入func.
//先用terminal try
import readline from 'readline';

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export function terminal(query){
	return new Promise(resolve => rl.question(query, answer => resolve(answer)));
}


