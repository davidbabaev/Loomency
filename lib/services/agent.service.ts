import { getCustomerProfileCard } from "../agent/tools/get-customer-profile";
import { runTool } from "../agent/tools/run-tool";
import { ToolContext } from "../agent/tools/tool-context";
import { callClaude, ChatMessage, ContentBlock } from "../llm/claude.client";

const MAX_ROUNDS = 5;
const FALLBACK_REPLY = "Sorry, I'm having trouble right now. A team memeber will get back to you shortly";

export async function runAgentLoop(
    systemPrompt: string,
    messages: ChatMessage[],
    context: ToolContext,
) : Promise<string> {
    for(let round = 1; round <= MAX_ROUNDS; round++) {
        const result = await callClaude(systemPrompt, messages, [getCustomerProfileCard]);

        if(result.stopReason !== "tool_use") {
            return result.text;
        }

        messages.push({role: "assistant", content: result.content});
        const toolResults: ContentBlock[] = [];

        for(const block of result.content){
            if(block.type === "tool_use"){
                toolResults.push(await runTool(block.name, block.id, context));
            }
        }
        messages.push({role: "user", content: toolResults});
    }
    return FALLBACK_REPLY
}