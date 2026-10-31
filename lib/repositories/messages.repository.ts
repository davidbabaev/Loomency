import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { messages } from "../db/schema";
type NewMessage = typeof messages.$inferInsert;


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
        .orderBy(asc(messages.created_at))
}

export async function createMessageRepo(data: NewMessage){
    // [newMessage] --> the first item, 
    // same as const newMessage = result[0];

    const [newMessage] = await db
        .insert(messages)
        .values(data)
        .returning();
    return newMessage;
}

export async function getRecentMessagesRepo(
    conversationId: number,
    businessId: number,
    limit: number
){
    // Why keep the old function? getMessagesByConversationIdRepo still returns the full history. Your messages API route uses it, because the dashboard should show employees every message. Only the agent gets the window.
    
    const rows = await db
        .select()
        .from(messages)
        .where(and(
            eq(messages.conversation_id, conversationId),
            eq(messages.business_id, businessId),
        ))
        .orderBy(desc(messages.created_at))
        .limit(limit)
    return rows.reverse();
}