import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const system = "You are the WhatsApp assistant for Mario's Pizza. Be warm and casual. Keep answers to 1-2 sentences.";

function getText(response: Anthropic.Message): string {
    const block = response.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text : "(no text)"
}

// Typing the same message twice by hand isn't how real memory works. The course says it too: they wrote it out the long way "so it is clear what is going on," and in a real app you'd "just append to the messages list."

// So what is memory in code? One list that grows. You don't rebuild the conversation for each call. You keep a single array, and every new message gets added to it: the customer's, then Claude's reply, then the customer's next one. Each call sends the whole array as it currently stands.

// In Loomency, that array will come from the database: each WhatsApp conversation's messages, saved as they arrive.

/* async function main() {
    // call 1: the customer's first message
    const response1 = await client.messages.create({
        model: 'claude-sonnet-5-5',
        max_tokens: 5000,
        system: system,
        messages: [{role: 'user', content: "Hi, I'd like to order a large margarita pizza"}],
    });
    console.log("Call 1:", getText(response1));
    
    // Call 2: the follow-up, WITHOUT the earlier messages
    const response2 = await client.messages.create({
        model: 'claude-sonnet-5-5',
        max_tokens: 5000,
        system: system,
        messages: [
            {role: 'user', content: "Hi, I'd like to order a large margarita pizza"},
            {role: 'assistant', content: getText(response1)},
            {role: 'user', content: "Actually, make it two."}
        ],
    });
    console.log("Call 2:", getText(response2));
} */


async function main() {
    const conversation: Anthropic.MessageParam[] = [];

    // customer's first message
    conversation.push({role:'user', content: "Hi, I'd like to order a large margherita pizza."})

    const response1 = await client.messages.create({
        model: 'claude-sonnet-5-5',
        max_tokens: 5000,
        system: system,
        messages: conversation,
    });
    const reply1 = getText(response1);
    console.log("Call 1:", reply1);
    console.log("Call 1 input tokens:", response1.usage.input_tokens);
    
    conversation.push({role:'assistant', content: reply1});
    
    // Customer's second message
    conversation.push({role: "user", content: "Actually, make it two."});

    const response2 = await client.messages.create({
        model: 'claude-sonnet-5-5',
        max_tokens: 5000,
        system: system,
        messages: conversation,
    });
    console.log("Call 2:", getText(response2));
    console.log("Call 2 input tokens:", response2.usage.input_tokens);
    // usage.input_tokens is how many tokens you sent to Claude in that call: the system prompt plus every message in the array. You pay for those.
}

main();