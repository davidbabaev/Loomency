import { eq } from "drizzle-orm"
import { db } from "../db"
import { businesses } from "../db/schema"

export async function getBusinessById(business_id: number){
    const result = await db
        .select()
        .from(businesses)
        .where(eq(businesses.business_id, business_id))
        .limit(1)
    return result[0]
}