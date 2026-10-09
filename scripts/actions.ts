import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

type ToolDefinition = {
  toolName: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
};

const tools: ToolDefinition[] = [
  {
    toolName: "get_order_status",
    description: "Looks up the current delivery status of a customer's order.",
    parameters: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "The order number, digits only, without the # sign" },
      },
      required: ["order_id"],
    },
  },
  {
    toolName: "get_opening_hours",
    description: "Returns the restaurant's opening hours for a given day.",
    parameters: {
      type: "object",
      properties: {
        day: { type: "string", description: "Day of the week in English, for example saturday" },
      },
      required: ["day"],
    },
  },
  {
    toolName: "reply_to_customer",
    description: "Sends the final reply to the customer and ends the conversation turn.",
    parameters: {
      type: "object",
      properties: {
        message: { type: "string", description: "The full message to send to the customer" },
      },
      required: ["message"],
    },
  },
];

const system =
  "You are the WhatsApp assistant for Mario's Pizza.\n\n" +
  "Available tools:\n" +
  JSON.stringify(tools, null, 2) +
  "\n\n" +
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
    const parsed = JSON.parse(text.substring(start + 9, end));
    if (
      typeof parsed.toolName === "string" &&
      typeof parsed.args === "object" &&
      parsed.args !== null
    ) {
      return parsed;
    }
    return null;
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

type ActionResult = { result: string } | { error: string };

function runAction(action: Action): ActionResult {
  if (action.toolName === "get_order_status") {
    const orderId = action.args.order_id;
    if (!orderId) return { error: "Missing argument: order_id" };
    const status = fakeOrders[orderId];
    return status ? { result: status } : { error: `Order ${orderId} not found` };
  }
  if (action.toolName === "get_opening_hours") {
    const day = action.args.day;
    if (!day) return { error: "Missing argument: day" };
    const hours = fakeHours[day.toLowerCase()];
    return hours ? { result: hours } : { error: `No opening hours found for ${day}` };
  }
  return { error: `Unknown action: ${action.toolName}` };
}

function validateArgs(action: Action): string | null {
  const tool = tools.find((t) => t.toolName === action.toolName);
  if (!tool) {
    const available = tools.map((t) => t.toolName).join(", ");
    return `Unknown action: ${action.toolName}. Available actions: ${available}`;
  }

  for (const name of tool.parameters.required) {
    const value = action.args[name];
    if (typeof value !== "string" || value.trim() === "") {
      const hint = tool.parameters.properties[name].description;
      return `Missing or invalid argument "${name}" for ${tool.toolName}. Expected: ${hint}`;
    }
  }
  return null;
}

async function main() {
  const conversation: Anthropic.MessageParam[] = [
    { role: "user", content: "Hi, where is my order #1042? And are you open on Saturday?" },
  ];
  const maxIterations = 5;
  const maxErrors = 3;
  let errorCount = 0;
  let iterations = 0;
  let finished = false;

  while (iterations < maxIterations) {
    iterations++;
    if (errorCount >= maxErrors) {
      console.log("\nToo many errors. Reply to customer: Sorry, I'm having trouble with that. Let me connect you with our team.");
      finished = true;
      break;
    }
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
      errorCount++;
      conversation.push({
        role: "user",
        content: "Error: no valid action found. Respond with exactly one action block.",
      });
      continue;
    }

    const validationError = validateArgs(action);
    if (validationError) {
      console.log("Validation error:", validationError);
      errorCount++;
      conversation.push({ role: "user", content: JSON.stringify({ error: validationError }) });
      continue;
    }

    if (action.toolName === "reply_to_customer") {
      console.log("\nReply to customer:", action.args.message);
      finished = true;
      break;
    }

    const result = runAction(action);
    if ("error" in result) errorCount++;
    console.log("Result:", result);
    conversation.push({ role: "user", content: JSON.stringify(result) });
  }

  if (!finished) {
    console.log("\nStopped: reached the maximum number of iterations.");
  }
}

main();