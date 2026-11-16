import { ToolCard } from "@/lib/llm/claude.client"
import { ToolContext } from "./tool-context";

type Tool = {
    card: ToolCard;
    run: (input: unknown, context: ToolContext) => Promise<string>;
}