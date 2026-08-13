import { and, asc, eq } from "drizzle-orm";
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
    const [newMessage] = await db
        .insert(messages)
        .values(data)
        .returning();
    return newMessage;
}