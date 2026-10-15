import { buildSystemPrompt } from "@/lib/agent/system-prompt";
import { ExternalServiceError } from "@/lib/errors";
import { callClaude } from "@/lib/llm/claude.client";
import { getBusinessById } from "@/lib/repositories/businesses.repository";

const FALLBACK_REPLY = "Sorry, I'm having trouble right now. A team member will get back to you shortly."

// const SYSTEM_PROMPT = "You are the WhatsApp assistant for Mario's Pizza, a pizzeria in Haifa. " + "Be warm and brief. " + "If you don't know something, say no. Never invent information";

// const marios = {
//     business_id: 1,
//     business_name: "Mario's Pizza",
//     country: "Israel",
//     address: "Herzl 10, Haifa",
//     field: "Pizzeria",
//     phone_number: "04-1234567",
//     created_at: new Date(),
// };

const BUSINESS_ID = 1;

async function main(){
    try{
        // const result = await callClaude(SYSTEM_PROMPT ,"Are you open on Saturday?");
        const business = await getBusinessById(BUSINESS_ID)

        if(!business){
            console.log("Business not found");
            return;
        }

        const systemPrompt = buildSystemPrompt(business);
        console.log(systemPrompt);
        
        const result = await callClaude(systemPrompt, "Are you open on Saturday?")
        console.log(result.text);
        console.log(result.stopReason);
        console.log("inputTokens", result.inputTokens, "outputTokens" ,result.outputTokens);
    }
    catch(err){
        if(err instanceof ExternalServiceError){
            console.log("Status", err.statusCode);
        }
        console.log("Reply to customer:", FALLBACK_REPLY);
    }   
}

main();