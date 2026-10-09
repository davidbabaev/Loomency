import Anthropic from "@anthropic-ai/sdk";

type ToolInput = Record<string, unknown>;
type ToolFunction = (input: ToolInput) => string | Promise<string>;

const FALLBACK_REPLY = "Sorry, I'm having trouble right now. Let me connect you with our team.";

class Agent {
  private client = new Anthropic();
  private tools: Anthropic.Tool[] = [];
  private toolFunctions = new Map<string, ToolFunction>();

  constructor(private system: string, private maxIterations = 5) {}

  registerTool(definition: Anthropic.Tool, fn: ToolFunction): void {
    this.tools.push(definition);
    this.toolFunctions.set(definition.name, fn);
  }

  async run(userMessage: string): Promise<{ reply: string; history: Anthropic.MessageParam[] }> {
    const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }];

    for (let i = 1; i <= this.maxIterations; i++) {
      console.log(`\n--- Iteration ${i} ---`);

      let response: Anthropic.Message;
      try {
        response = await this.client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          system: this.system,
          tools: this.tools,
          messages,
        });
      } catch (e) {
        console.log("API error:", e instanceof Error ? e.message : String(e));
        return { reply: FALLBACK_REPLY, history: messages };
      }

      console.log("stop_reason:", response.stop_reason);
      messages.push({ role: "assistant", content: response.content });

      if (response.stop_reason !== "tool_use") {
        const reply = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n");
        return { reply, history: messages };
      }

      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === "tool_use") {
          results.push(await this.executeTool(block));
        }
      }
      messages.push({ role: "user", content: results });
    }

    console.log("Stopped: reached the maximum number of iterations.");
    return { reply: FALLBACK_REPLY, history: messages };
  }

  private async executeTool(block: Anthropic.ToolUseBlock): Promise<Anthropic.ToolResultBlockParam> {
    console.log("Tool call:", block.name, block.input);
    try {
      const fn = this.toolFunctions.get(block.name);
      if (!fn) throw new Error(`Unknown tool: ${block.name}`);
      const output = await fn(block.input as ToolInput);
      console.log("Result:", output);
      return { type: "tool_result", tool_use_id: block.id, content: output };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.log("Error:", message);
      return { type: "tool_result", tool_use_id: block.id, content: message, is_error: true };
    }
  }
}

// ---------- Setup: one business, its data, its tools ----------

const fakeOrders: Record<string, string> = {
  "1042": "Out for delivery, arriving in about 15 minutes",
};

const fakeHours: Record<string, string> = {
  saturday: "19:00-23:00",
  sunday: "12:00-23:00",
};

const agent = new Agent(
  "You are the WhatsApp assistant for Mario's Pizza. Be warm and brief.\n" +
    "Rules:\n" +
    "- Use the tools to look up order status and opening hours. Never invent these facts.\n" +
    "- If a tool returns an error, explain the problem to the customer honestly.\n" +
    "- Answer every question the customer asked, in one reply.\n" +
    "- Format for WhatsApp: plain text, *single asterisks* for bold, no Markdown headings.",
  5
);

agent.registerTool(
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
  (input) => {
    const orderId = String(input.order_id ?? "");
    if (!orderId) throw new Error("Missing argument: order_id");
    const status = fakeOrders[orderId];
    if (!status) throw new Error(`Order ${orderId} not found`);
    return status;
  }
);

agent.registerTool(
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
  (input) => {
    const day = String(input.day ?? "").toLowerCase();
    if (!day) throw new Error("Missing argument: day");
    const hours = fakeHours[day];
    if (!hours) {
      throw new Error(`Opening hours for ${day} are not available in the system. Do not assume the restaurant is closed.`);
    }
    return hours;
  }
);

// ---------- Run ----------

async function main() {
  const { reply, history } = await agent.run("Hi, where is my order #9999? And are you open on Monday?");
  console.log("\nReply to customer:", reply);
  console.log(`\nHistory: ${history.length} messages`);
}

main();