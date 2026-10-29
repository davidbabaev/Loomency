// Start a run: insert a row into agent_runs, and get back its run_id.
// Finish a run: update that row with the totals (rounds, tokens, stop reason…).
// Record a tool call: insert a row into tool_calls.

import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { agentRuns, toolCalls } from "../db/schema";


type NewAgentRun = typeof agentRuns.$inferInsert;
type NewToolCall = typeof toolCalls.$inferInsert;

export async function createAgentRunRepo(data: NewAgentRun) {
    const [run] = await db
        .insert(agentRuns)
        .values(data)
        .returning();
    return run;
}

export async function updateAgentRunRepo(
    runId: number,
    business_id: number,
    data: Partial<NewAgentRun>
) {
    const [updated] = await db
        .update(agentRuns)
        .set(data)
        .where(and(
            eq(agentRuns.run_id, runId),
            eq(agentRuns.business_id, business_id),
        ))
        .returning();
    return updated;
}

export async function createToolCallRepo(data: NewToolCall) {
    const [toolCall] = await db
        .insert(toolCalls)
        .values(data)
        .returning();
    return toolCall;
}