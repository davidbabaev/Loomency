
import { AppError } from "@/lib/errors";
import { runAgent } from "@/lib/services/agent.service";

const FALLBACK_REPLY = "Sorry, I'm having trouble right now. A team member will get back to you shortly."

const BUSINESS_ID = 2;
const CONVERSATION_ID = 7;

async function main(){
    try{
        const reply = await runAgent(CONVERSATION_ID, BUSINESS_ID);
        console.log("Reply to Dana:", reply);
    }
    catch(err){
        if(err instanceof AppError){
            console.log("Status", err.statusCode);
        }
        console.log("Reply to customer:", FALLBACK_REPLY);
    }   
}

main();