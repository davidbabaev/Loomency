// repository - the storekeeper 

import {db} from "@/lib/db"
import {conversations} from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function getAllConversations(business_id: number) {
    return await db
        .select()
        .from(conversations)
        .where(eq(conversations.business_id, business_id))
}

export async function insertConversation(
    data: typeof conversations.$inferInsert
) {
    const result = await db
        .insert(conversations)
        .values(data)
        .returning();
    return result[0];
}