import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const system =
  "You are the WhatsApp assistant for Mario's Pizza. " +
  "You can take these actions:\n" +
  "- get_order_status: args {\"order_id\": string}\n" +
  "- get_opening_hours: args {\"day\": string}\n" +
  "- reply_to_customer: args {\"message\": string}\n\n" +
  "You will always respond in this exact format:\n" +
  "<your reasoning>\n" +
  "```action\n" +
  "{\"toolName\": \"<action_name>\", \"args\": {<arguments>}}\n" +
  "```\n\n" +
  "Take one action at a time. After each action, you will be told the result.";

function getText(response: Anthropic.Message): string {
  const block = response.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "(no text)";
}

type Action = { toolName: string; args: Record<string, string> };

function parseAction(text: string): Action | null {
  const start = text.indexOf("```action");
  if (start === -1) return null;
  const end = text.indexOf("```", start + 9);
  if (end === -1) return null;

  try {
    return JSON.parse(text.substring(start + 9, end));
  } catch {
    return null;
  }
}

const fakeOrders: Record<string, string> = {
  "1042": "Out for delivery, arriving in about 15 minutes",
};

const fakeHours: Record<string, string> = {
  saturday: "19:00-23:00",
  sunday: "12:00-23:00",
};

function runAction(action: Action): string {
  if (action.toolName === "get_order_status") {
    return fakeOrders[action.args.order_id] ?? "Order not found";
  }
  if (action.toolName === "get_opening_hours") {
    return fakeHours[action.args.day.toLowerCase()] ?? "No hours found for that day";
  }
  return `Unknown action: ${action.toolName}`;
}

/* async function main() {
  const conversation: Anthropic.MessageParam[] = [];
  conversation.push({ role: "user", content: "Hi, where is my order #1042?" });

  // Turn 1: Claude picks an action
  const response1 = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: system,
    messages: conversation,
  });
  const text1 = getText(response1);
  conversation.push({ role: "assistant", content: text1 });

  const action1 = parseAction(text1);
  console.log("Turn 1 action:", action1);
  if (!action1) return;

  // Your code runs the action and sends the result back
  const result = runAction(action1.name, action1.argument);
  console.log("Result:", result);
  conversation.push({ role: "user", content: `Result: ${result}` });

  // Turn 2: Claude picks the next action
  const response2 = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: system,
    messages: conversation,
  });
  const action2 = parseAction(getText(response2));
  console.log("Turn 2 action:", action2);
} */

  async function main() {
  const conversation: Anthropic.MessageParam[] = [
    { role: "user", content: "Hi, where is my order #1042? And are you open on Saturday?" },
  ];
  const maxIterations = 5;
  let iterations = 0;
  let finished = false;

  while (iterations < maxIterations) {
    iterations++;
    console.log(`\n--- Iteration ${iterations} ---`);

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: system,
      messages: conversation,
    });
    const text = getText(response);
    conversation.push({ role: "assistant", content: text });

    const action = parseAction(text);
    console.log("Action:", action);

    if (!action) {
      conversation.push({
        role: "user",
        content: "Error: no valid action found. Respond with exactly one action block.",
      });
      continue;
    }

    if (action.toolName === "reply_to_customer") {
      console.log("\nReply to customer:", action.args.message);
      finished = true;
      break;
    }

    const result = runAction(action);
    console.log("Result:", result);
    conversation.push({ role: "user", content: `Result: ${result}` });
  }

  if (!finished) {
    console.log("\nStopped: reached the maximum number of iterations.");
  }
}

main();