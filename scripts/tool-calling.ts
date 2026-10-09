import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const fakeOrders: Record<string, string> = {
  "1042": "Out for delivery, arriving in about 15 minutes",
};

const fakeHours: Record<string, string> = {
  saturday: "19:00-23:00",
  sunday: "12:00-23:00",
};

const tools: Anthropic.Tool[] = [
  {
    name: "get_order_status",
    description: "Looks up the current delivery status of a customer's order.",
    input_schema: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "The order number, digits only, without the # sign" },
      },
      required: ["order_id"],
    },
  },
  {
    name: "get_opening_hours",
    description: "Returns the restaurant's opening hours for a given day.",
    input_schema: {
      type: "object",
      properties: {
        day: { type: "string", description: "Day of the week in English, for example saturday" },
      },
      required: ["day"],
    },
  },
];

type ToolInput = Record<string, unknown>;

const toolFunctions: Record<string, (input: ToolInput) => string> = {
  get_order_status: (input) => {
    const orderId = String(input.order_id ?? "");
    if (!orderId) throw new Error("Missing argument: order_id");
    const status = fakeOrders[orderId];
    if (!status) throw new Error(`Order ${orderId} not found`);
    return status;
  },
  get_opening_hours: (input) => {
    const day = String(input.day ?? "").toLowerCase();
    if (!day) throw new Error("Missing argument: day");
    const hours = fakeHours[day];
    if (!hours) {
      throw new Error(`No opening hours found for ${day}. Known days: ${Object.keys(fakeHours).join(", ")}`);
    }
    return hours;
  },
};

const system =
  "You are the WhatsApp assistant for Mario's Pizza. Be warm and brief.\n" +
  "Rules:\n" +
  "- Use the tools to look up order status and opening hours. Never invent these facts.\n" +
  "- If a tool returns an error, explain the problem to the customer honestly.\n" +
  "- Answer every question the customer asked, in one reply.";

async function main() {
  const messages: Anthropic.MessageParam[] = [
        { role: "user", content: "Hi, where is my order #9999? And are you open on Monday?" },
  ];
  const maxIterations = 5;

  for (let i = 1; i <= maxIterations; i++) {
    console.log(`\n--- Iteration ${i} ---`);

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system,
      tools,
      messages,
    });
    console.log("stop_reason:", response.stop_reason);

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      console.log("\nReply to customer:", text);
      return;
    }

    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      console.log("Tool call:", block.name, block.input);

      const fn = toolFunctions[block.name];
      try {
        if (!fn) throw new Error(`Unknown tool: ${block.name}`);
        const output = fn(block.input as ToolInput);
        console.log("Result:", output);
        results.push({ type: "tool_result", tool_use_id: block.id, content: output });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.log("Error:", message);
        results.push({ type: "tool_result", tool_use_id: block.id, content: message, is_error: true });
      }
    }

    messages.push({ role: "user", content: results });
  }

  console.log("\nStopped: reached the maximum number of iterations.");
}

main();