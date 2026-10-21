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

export type ContentBlock = 
    | {type: "text"; text: string} 
    | {type: "tool_use"; id: string; name: string; input: unknown}
    | {type: "tool_result"; tool_use_id: string; content: string;   is_error?: boolean};

export type ChatMessage = {
    role: "user" | "assistant";
    content: string | ContentBlock[];
}       

export type ToolCard = {
    name: string;
    description: string;
    input_schema: { // can contain another object shape inside it.
        type: "object";
        properties: Record<string, unknown>; //means “an object whose keys are Key and whose values are Value.”
        // string keys: input names like model or color.
        // unknown values: each input’s description can have any shape, so we don’t restrict it here.
        required?:string[]; // ? means optional
    };
}

export async function callClaude(
    systemPrompt: string, 
    messages: ChatMessage[],
    tools: ToolCard[]
){

    let response;
    try{
        response = await client.messages.create({
            model: MODEL,
            max_tokens: 300,
            system: systemPrompt,
            messages,
            tools,
        });
    }
    catch(err){
        console.error("Claude API call failed:", err);
        throw new ExternalServiceError("AI service is unavailable");
    }

    const content: ContentBlock[] = [];

    for(const block of response.content) {
        if(block.type === "text") {
            content.push({type: "text", text: block.text});
        }
        if(block.type === "tool_use"){
            content.push({
                type: "tool_use", 
                id: block.id, 
                name: block.name, 
                input: block.input
            })
        }
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
        outputTokens: response.usage.output_tokens,
        content
    };
}