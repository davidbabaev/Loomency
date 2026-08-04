import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { messages } from "../db/schema";


export async function getMessagesByConversationIdRepo(
    conversationId: number,
    business_id: number,
){
    return await db
        .select()
        .from(messages)
        .where(and(
            eq(messages.conversation_id, conversationId),
            eq(messages.business_id, business_id),
        ))
}