import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function main(){
    const response = await client.messages.create({
        model: "claude-sonnet-5-5",
        max_tokens: 300,
        system: "You are a helpful assistant that concise answers.",
        messages: [
            {role: "user", content: "What is TypeScript in one sentence?"}
        ],
    });

    const block = response.content[0]
    if(block.type === "text"){
        console.log(block.text);
    }
}

main();