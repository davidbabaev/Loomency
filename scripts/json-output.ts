import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const customerMessage = "Hi, my order #1042 still hasn't arrived and I'm really upset. It's been 2 hours!";

// main():
// - model 
// - max_tokens 
// - system
// - messages: [role, content] 

async function main(){
    const response = await client.messages.create({
        model: 'claude-sonnet-5-5',
        max_tokens: 5000,
        system: 
        'You analyze customer WhatsApp messages for a business. ' +
        'Always respond with valid JSON only, no other text. ' +
        'Format: {"intent": "order_status" | "opening_hours" | "complaint" | "other", "urgent": true or false, "summary": "one short sentence"}',
        messages: [{role: 'user', content: customerMessage}],
    })

    const block = response.content.find((b) => b.type === 'text');
    if(!block || block.type !== 'text'){
        console.log("No text in the response. stop_reason:", response.stop_reason);
        return;
    }

    console.log("Raw text:", block.text);
    
    try{
        const parsed = JSON.parse(block.text);
        console.log("Intent:", parsed.intent);
        console.log("Urgent:",parsed.urgent);
        console.log("SummaryL",parsed.summary);
    }
    catch{
        console.log("Not valid JSON");
    }
}

main();