
import { AppError } from "@/lib/errors";
import { runAgent } from "@/lib/services/agent.service";

const FALLBACK_REPLY = "Sorry, I'm having trouble right now. A team member will get back to you shortly."

const BUSINESS_ID = 2;
const CONVERSATION_ID = 7;

async function main(){
    try{
/*         const business = await getBusinessById(BUSINESS_ID)

        if(!business){
            console.log("Business not found");
            return;
        }

        const systemPrompt = buildSystemPrompt(business);

        const rows = await getMessagesByConversationIdRepo(CONVERSATION_ID, BUSINESS_ID);
        const conversation = toChatMessages(rows);

        if(conversation.length === 0){
            console.log('No messages  in this conversation');
            return;
        }

        console.log(conversation);
        const reply = await runAgentLoop(
            systemPrompt, 
            conversation, 
            {businessId: BUSINESS_ID, customerId: 2}
        );
        console.log("Reply to Dana:", reply); */

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