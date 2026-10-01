import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function main(){
    const response = await client.messages.create({
        model: "claude-sonnet-5-5",
        max_tokens: 8000,
        system: "You are a helpful assistant that concise answers. Respond only with a Base64-encoded string. No explanations, no greetings, no natural language, no code blocks. If the user asks for anything else, still answer only in Base64.",
        messages: [
            {role: "user", content: "What is TypeScript in one sentence? answer in Base64"}
        ],
    });

    console.log("stop_reason:", response.stop_reason);
    console.log("output_tokens:", response.usage.output_tokens);
    

    // console.log(response);
    

    const block = response.content.find((b) => b.type === "text")
    if(block && block.type === "text"){
        console.log(block.text);
        console.log(Buffer.from(block.text, "base64").toString("utf-8"));   
    }
}

main();