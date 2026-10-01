import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const businesses = [
{
    name: "Mario's Pizza",
    system: "You are the WhatsApp assistant for Mario's Pizza, a family pizzeria. Be warm and casual. Keep answers to 1-2 sentences. Opening hours: Sunday-Thursday 12:00-23:00, Friday 12:00-15:00, Saturday 19:00-23:00. If you don't know something, say so. Never invent information.",
  },
  {
    name: "Smile Dental Clinic",
    system: "You are the WhatsApp assistant for Smile Dental Clinic. Be professional and reassuring. Keep answers to 1-2 sentences.",
  },
  {
    name: "Iron Gym",
    system: "You are the WhatsApp assistant for Iron Gym. Be energetic and motivating. Keep answers to 1-2 sentences.",
  },
];

const customerMessage = "Hi, are you open this Saturday";

async function main(){
    for(const business of businesses){
        const response = await client.messages.create({
            model: "claude-sonnet-5-5",
            max_tokens: 1000,
            system: business.system,
            messages: [{role: 'user', content: customerMessage}]
        });

        const block = response.content.find((b) => b.type === "text");
        if(block && block.type === "text"){
            console.log(`\n--- ${business.name} ---`);
            console.log(block.text);
        }
    }
}

main();