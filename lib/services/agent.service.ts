import { toChatMessages } from "../agent/history";
import { buildSystemPrompt } from "../agent/system-prompt";
import { getCustomerProfileCard } from "../agent/tools/get-customer-profile";
import { runTool } from "../agent/tools/run-tool";
import { ToolContext } from "../agent/tools/tool-context";
import { AppError, ConflictError, NotFoundError } from "../errors";
import { callClaude, ChatMessage, ContentBlock } from "../llm/claude.client";
import { getBusinessById } from "../repositories/businesses.repository";
import { getConversationByIdRepo } from "../repositories/conversations.repository";
import { createMessageRepo, getMessagesByConversationIdRepo } from "../repositories/messages.repository";

const MAX_ROUNDS = 5;
const FALLBACK_REPLY = "Sorry, I'm having trouble right now. A team member will get back to you shortly.";

export async function runAgentLoop(
    systemPrompt: string,
    messages: ChatMessage[],
    context: ToolContext,
) : Promise<string> {
    for(let round = 1; round <= MAX_ROUNDS; round++) {
        const result = await callClaude(systemPrompt, messages, [getCustomerProfileCard]);

        // if(result.stopReason !== "tool_use") {
        //     return result.text;
        // }

        if(result.stopReason !== "tool_use"){
            if(result.stopReason === "end_turn" && result.text.trim() !== ""){
                return result.text;
            }

            console.log("Agent gave an unusable answer:", result.stopReason);
            return FALLBACK_REPLY;
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

export async function runAgent(conversationId: number, businessId: number): Promise<string> {
    const conversation = await getConversationByIdRepo(conversationId, businessId);
    if(!conversation) {
        throw new NotFoundError("Conversation not found");
    }
    if(!conversation.customer_id){
        throw new AppError("Conversation has no customer", 400)
    }

    const business = await getBusinessById(businessId);
    if(!business){
        throw new NotFoundError("Business not found");
    }

    const rows = await getMessagesByConversationIdRepo(conversationId, businessId);
    const messages = toChatMessages(rows);
    if(messages.length === 0) {
        throw new AppError("Conversation has no messages", 400);
    }

    const lastRow = rows[rows.length - 1];
    if(lastRow.sender_type !== "customer") {
        throw new ConflictError("Nothing to reply to: the last message is not from the customer");
    }

    const systemPrompt = buildSystemPrompt(business);
    const context = {businessId, customerId: conversation.customer_id};


    const reply = await runAgentLoop(systemPrompt, messages, context);
    await createMessageRepo({
        conversation_id: conversationId,
        business_id: businessId,
        message_text: reply,
        sender_type: "agent",
    });
    return reply;
}