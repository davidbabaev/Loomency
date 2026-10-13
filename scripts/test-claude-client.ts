import { callClaude } from "@/lib/llm/claude.client";

async function main(){
    const response = await callClaude('Are you open on Saturday?');
    console.log(response);
}

main();