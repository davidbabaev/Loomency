import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic();

interface BusinessInfo{
    name: string;
    tone: string;
    openingHours: Record<string, string>;
}

const business: BusinessInfo = {
    name: "Mario's Pizza",
    tone: 'warm and casual',
    openingHours: {
        "sunday-thursday": "12:00-23:00",
        friday: "12:00-15:00",
        saturday: "19:00-23:00"
    },
};

async function main(){
    const response = await client.messages.create({
        model: 'claude-sonnet-5-5',
        max_tokens: 5000,
        system: "You are the WhatsApp assistant for the business described below. " +
        "Use only this information. If you don't know something, say so. Never invent information. " +
        "Keep answers to 1-2 sentences.\n\n" +
        `Business info:\n${JSON.stringify(business, null, 2)}`,
        messages: [{role: 'user', content: 'Hi, are you open on Friday evening?'}]
    });

    const block = response.content.find((b) => b.type === "text");
    if(!block || block.type !== 'text'){
        console.log("No text in the response. stop_reason", response.stop_reason);
        return;
    }

    console.log(block.text);
}

main();