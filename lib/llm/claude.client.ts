import Anthropic from "@anthropic-ai/sdk";
// this file would be the connection to claude
// it would use anthropic api key
// it would create client object
// only this file talks to claude, the rest of Loomency ask fo this file. same as repository files allowed to touch db.

const client = new Anthropic();
const MODEL = "claude-haiku-4-5-20251001";

export async function callClaude(userText: string){
    const response = await client.messages.create({
        model: MODEL,
        max_tokens: 300,
        messages: [{role: 'user', content: userText}]
    });

    return response;
}