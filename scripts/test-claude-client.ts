import { ExternalServiceError } from "@/lib/errors";
import { callClaude } from "@/lib/llm/claude.client";

const FALLBACK_REPLY = "Sorry, I'm having trouble right now. A team member will get back to you shortly."

async function main(){
    try{
        const result = await callClaude("Are you open on Saturday?");
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