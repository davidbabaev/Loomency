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