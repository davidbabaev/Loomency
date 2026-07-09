// repository - the storekeeper 

import {db} from "@/lib/db"
import {conversations} from "@/lib/db/schema"

export async function getAllConversations() {
    return await db.select().from(conversations)
}