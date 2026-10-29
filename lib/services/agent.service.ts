import { toChatMessages } from "../agent/history";
import { buildSystemPrompt } from "../agent/system-prompt";
import { getCustomerProfileCard } from "../agent/tools/get-customer-profile";
import { runTool } from "../agent/tools/run-tool";
import { ToolContext } from "../agent/tools/tool-context";
import { AppError, ConflictError, NotFoundError } from "../errors";
import { callClaude, ChatMessage, ContentBlock } from "../llm/claude.client";
import { createAgentRunRepo, updateAgentRunRepo } from "../repositories/agent-runs.repository";
import { getBusinessById } from "../repositories/businesses.repository";
import { getConversationByIdRepo } from "../repositories/conversations.repository";
import { createMessageRepo, getMessagesByConversationIdRepo } from "../repositories/messages.repository";

const MAX_ROUNDS = 5;
const FALLBACK_REPLY = "Sorry, I'm having trouble right now. A team member will get back to you shortly.";

type AgentResult = {
    reply: string;
    rounds: number;
    inputTokens: number;
    outputTokens: number;
    stopReason: string | null;
    usedFallback: boolean; 
};

export async function runAgentLoop(
    systemPrompt: string,
    messages: ChatMessage[],
    context: ToolContext,
) : Promise<AgentResult> {

    let inputTokens = 0;
    let outputTokens = 0;
    let stopReason: string | null = null;


    for(let round = 1; round <= MAX_ROUNDS; round++) {
        const result = await callClaude(
            systemPrompt, 
            messages, 
            [getCustomerProfileCard]
        );

        inputTokens += result.inputTokens;
        outputTokens += result.outputTokens;
        stopReason = result.stopReason;

        if(result.stopReason !== "tool_use"){
            if(result.stopReason === "end_turn" && result.text.trim() !== ""){
                return {
                    reply: result.text,
                    rounds: round,
                    inputTokens,
                    outputTokens,
                    stopReason,
                    usedFallback: false,
                };
            }
            
            console.log("Agent gave an unusable answer:", result.stopReason);
            return {
                reply: FALLBACK_REPLY,
                rounds: round,
                inputTokens,
                outputTokens,
                stopReason,
                usedFallback: true,
            };
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

    return {
        reply: FALLBACK_REPLY,
        rounds: MAX_ROUNDS,
        inputTokens,
        outputTokens,
        stopReason,
        usedFallback: true,
    };
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


    const run = await createAgentRunRepo({
        business_id: businessId,
        conversation_id: conversationId
    });

    let result;
    try{
        result = await runAgentLoop(systemPrompt, messages, context);
    }
    catch(error){
        await updateAgentRunRepo(run.run_id, businessId, {
            error_message: error instanceof Error ? error.message : "Unknown error",
            finished_at: new Date(),
        });
        throw error;
    }

    await updateAgentRunRepo(run.run_id, businessId, {
        rounds: result.rounds,
        input_tokens: result.inputTokens,
        output_tokens: result.outputTokens,
        stop_reason: result.stopReason,
        used_fallback: result.usedFallback,
        finished_at: new Date(),
    });



    // const result  = await runAgentLoop(systemPrompt, messages, context);
    console.log("Run stats:", result);
    
    await createMessageRepo({
        conversation_id: conversationId,
        business_id: businessId,
        message_text: result.reply,
        sender_type: "agent",
    });

    return result.reply;
}