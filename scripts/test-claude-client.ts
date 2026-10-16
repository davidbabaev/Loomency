import { toChatMessages } from "@/lib/agent/history";
import { buildSystemPrompt } from "@/lib/agent/system-prompt";
import { ExternalServiceError } from "@/lib/errors";
import { callClaude, ChatMessage } from "@/lib/llm/claude.client";
import { getBusinessById } from "@/lib/repositories/businesses.repository";
import { getMessagesByConversationIdRepo } from "@/lib/repositories/messages.repository";

const FALLBACK_REPLY = "Sorry, I'm having trouble right now. A team member will get back to you shortly."

const BUSINESS_ID = 2;
const CONVERSATION_ID = 7;

async function main(){
    try{
        const business = await getBusinessById(BUSINESS_ID)

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
        const result = await callClaude(systemPrompt, conversation);
        console.log('Agent:', result.text);
        console.log('Input tokens:', result.inputTokens);
        
        

/*         const conversation: ChatMessage[] = [];
        conversation.push({role: "user", content: "Hi, I saw you have Porsche 911 for sale?"})

        const result = await callClaude(systemPrompt, conversation)
        console.log(result.text);
        console.log(result.stopReason);
        console.log("inputTokens", result.inputTokens, "outputTokens" ,result.outputTokens);

        conversation.push({role: "assistant", content: result.text});
        // conversation.push({role: "user", content: "Is it available in yellow?"});
        conversation.push({ role: "user", content: "Which car did I ask about?" });
        
        const second = await callClaude(systemPrompt, conversation);
        console.log("Second answer:", second.text);
        console.log("Input tokens:", result.inputTokens, "->", second.inputTokens); */
        
    }
    catch(err){
        if(err instanceof ExternalServiceError){
            console.log("Status", err.statusCode);
        }
        console.log("Reply to customer:", FALLBACK_REPLY);
    }   
}

main();