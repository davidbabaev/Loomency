import { eq } from "drizzle-orm";
import { db } from "../db";
import { customers } from "../db/schema";


export async function getCustomerById(customerId: number){
    const result = await db
        .select()
        .from(customers)
        .where(eq(customers.customer_id, customerId))
        .limit(1)
    return result[0];
} 