import Anthropic from "@anthropic-ai/sdk";
import { ExternalServiceError } from "../errors";
// this file would be the connection to claude
// it would use anthropic api key
// it would create client object
// only this file talks to claude, the rest of Loomency ask fo this file. same as repository files allowed to touch db.

const apiKey = process.env.ANTHROPIC_API_KEY;
if(!apiKey){
    throw new Error("ANTHROPIC_API_KEY is missing. Add it to .env.local")
}

const client = new Anthropic({apiKey});

const MODEL = "claude-haiku-4-5-20251001";
// const MODEL = "calude-haiku-4-5-20251001"; // error check

export async function callClaude(userText: string){

    let response;
    try{
        response = await client.messages.create({
            model: MODEL,
            max_tokens: 300,
            messages: [{role: 'user', content: userText}]
        });
    }
    catch(err){
        console.error("Claude API call failed:", err);
        throw new ExternalServiceError("AI service is unavailable");
    }

    let text = "";
    const textBlock = response.content.find((block) => block.type === "text");

    if(textBlock && textBlock.type === "text"){
        text = textBlock.text;
    }

    return {
        text, 
        stopReason: response.stop_reason,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
    };
}