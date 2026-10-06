import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const system =
  "You are the WhatsApp assistant for Mario's Pizza. " +
  "You can take these actions:\n" +
  "- get_order_status(order_id)\n" +
  "- get_opening_hours(day)\n" +
  "- reply_to_customer(message)\n\n" +
  "You will always respond in this exact format:\n" +
  "<your reasoning>\n" +
  "```action\n" +
  "<action_name>(<argument>)\n" +
  "```\n\n" +
  "Take one action at a time. After each action, you will be told the result.";

function getText(response: Anthropic.Message): string {
  const block = response.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "(no text)";
}

async function main() {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: system,
    messages: [{ role: "user", content: "Hi, where is my order #1042?" }],
  });

    console.log("stop_reason:", response.stop_reason);
    console.log("block types:", response.content.map((b) => b.type));

  console.log(getText(response));
}

main();