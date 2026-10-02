import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function main(){
    const rl = readline.createInterface({input, output});
    const description = await rl.question("What function do you want to create? ");
    rl.close();

    console.log("You asked for:", description);
}

main();