import { asc, eq } from "drizzle-orm";
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

export async function getAllCustomers(business_id: number){
    return await db
        .select()
        .from(customers)
        .where(eq(customers.business_id, business_id))
        .orderBy(asc(customers.created_at))
}