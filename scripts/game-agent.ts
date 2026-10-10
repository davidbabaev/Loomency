import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// ---------- G: Goals ----------
interface Goal {
  name: string;
  description: string;
  priority: number;
}

// ---------- E: Environment (one business's data) ----------
interface BusinessEnvironment {
  businessName: string;
  getOrderStatus(orderId: string): string | undefined;
  getOpeningHours(day: string): string | undefined;
}

function createFakeEnvironment(
  businessName: string,
  orders: Record<string, string>,
  hours: Record<string, string>
): BusinessEnvironment {
  return {
    businessName,
    getOrderStatus: (orderId) => orders[orderId],
    getOpeningHours: (day) => hours[day.toLowerCase()],
  };
}

// ---------- A: Actions (defined with Zod, grouped by tags) ----------
interface AgentTool<T> {
  name: string;
  description: string;
  tags: string[];
  schema: z.ZodType<T>;
  execute: (input: T, env: BusinessEnvironment) => string;
}

function defineTool<T>(tool: AgentTool<T>): AgentTool<T> {
  return tool;
}

const orderStatusTool = defineTool({
  name: "get_order_status",
  description: "Looks up the current delivery status of a customer's order.",
  tags: ["orders"],
  schema: z.object({
    order_id: z.string().regex(/^\d+$/).describe("The order number, digits only, without the # sign"),
  }),
  execute: ({ order_id }, env) => {
    const status = env.getOrderStatus(order_id);
    if (!status) {
      throw new Error(`Order ${order_id} not found. Ask the customer to check the number in their confirmation message.`);
    }
    return status;
  },
});

const openingHoursTool = defineTool({
  name: "get_opening_hours",
  description: "Returns the business's opening hours for a given day.",
  tags: ["info"],
  schema: z.object({
    day: z.string().describe("Day of the week in English, for example saturday"),
  }),
  execute: ({ day }, env) => {
    const hours = env.getOpeningHours(day);
    if (!hours) {
      throw new Error(`Opening hours for ${day} are not available in the system. Do not assume the business is closed.`);
    }
    return hours;
  },
});

const allTools: AgentTool<any>[] = [orderStatusTool, openingHoursTool];

function selectTools(tags: string[]): AgentTool<any>[] {
  return allTools.filter((tool) => tool.tags.some((tag) => tags.includes(tag)));
}

// ---------- The agent: fixed loop, swappable GAME parts ----------
const FALLBACK_REPLY = "Sorry, I'm having trouble right now. Let me connect you with our team.";

class GameAgent {
  private client = new Anthropic();

  constructor(
    private goals: Goal[],
    private tools: AgentTool<any>[],
    private env: BusinessEnvironment,
    private maxIterations = 5
  ) {}

  private systemPrompt(): string {
    const goalLines = [...this.goals]
      .sort((a, b) => b.priority - a.priority)
      .map((g) => `- [Priority ${g.priority}] ${g.name}: ${g.description}`)
      .join("\n");
    return `You are the WhatsApp assistant for ${this.env.businessName}.\nYour goals:\n${goalLines}`;
  }

  private apiTools(): Anthropic.Tool[] {
    return this.tools.map((tool) => {
      const { $schema, ...schema } = z.toJSONSchema(tool.schema) as Record<string, unknown>;
      return {
        name: tool.name,
        description: tool.description,
        input_schema: schema as Anthropic.Tool.InputSchema,
      };
    });
  }

  private executeTool(block: Anthropic.ToolUseBlock): Anthropic.ToolResultBlockParam {
    console.log("  Tool call:", block.name, block.input);
    try {
      const tool = this.tools.find((t) => t.name === block.name);
      if (!tool) throw new Error(`Unknown tool: ${block.name}`);

      const parsed = tool.schema.safeParse(block.input);
      if (!parsed.success) {
        const problems = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
        throw new Error(`Invalid arguments: ${problems}`);
      }

      const output = tool.execute(parsed.data, this.env);
      console.log("  Result:", output);
      return { type: "tool_result", tool_use_id: block.id, content: output };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.log("  Error:", message);
      return { type: "tool_result", tool_use_id: block.id, content: message, is_error: true };
    }
  }

  async run(userMessage: string): Promise<string> {
    const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }];

    for (let i = 1; i <= this.maxIterations; i++) {
      let response: Anthropic.Message;
      try {
        response = await this.client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          system: this.systemPrompt(),
          tools: this.apiTools(),
          messages,
        });
      } catch (e) {
        console.log("  API error:", e instanceof Error ? e.message : String(e));
        return FALLBACK_REPLY;
      }

      messages.push({ role: "assistant", content: response.content });

      if (response.stop_reason !== "tool_use") {
        return response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n");
      }

      const results = response.content
        .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
        .map((b) => this.executeTool(b));
      messages.push({ role: "user", content: results });
    }

    return FALLBACK_REPLY;
  }
}

// ---------- Two businesses, same agent design ----------
const goals: Goal[] = [
  { name: "honesty", description: "Never invent order details or hours. Only use tool results.", priority: 10 },
  { name: "complete", description: "Answer every question the customer asked, in one reply.", priority: 8 },
  { name: "style", description: "Be warm and brief. Plain text for WhatsApp, no Markdown.", priority: 5 },
];

const marios = createFakeEnvironment(
  "Mario's Pizza",
  { "1042": "Out for delivery, arriving in about 15 minutes" },
  { saturday: "19:00-23:00", sunday: "12:00-23:00" }
);

const sakura = createFakeEnvironment(
  "Sakura Sushi",
  { "1042": "Delivered yesterday at 20:15" },
  { saturday: "12:00-22:00" }
);

const mariosAgent = new GameAgent(goals, selectTools(["orders", "info"]), marios);
const sakuraAgent = new GameAgent(goals, selectTools(["info"]), sakura);

async function main() {
  const question = "Hi, where is my order #1042? And are you open on Saturday?";

  console.log("\n===== Mario's Pizza (tools: orders + info) =====");
  console.log("Reply:", await mariosAgent.run(question));

  console.log("\n===== Sakura Sushi (tools: info only) =====");
  console.log("Reply:", await sakuraAgent.run(question));
}

main();