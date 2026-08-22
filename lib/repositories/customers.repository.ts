import { and, asc, eq } from "drizzle-orm";
import { db } from "../db";
import { customers } from "../db/schema";
type NewCustomer = typeof customers.$inferInsert;


export async function getCustomerById(
    customerId: number,
    business_id: number
){
    const result = await db
        .select()
        .from(customers)
        .where(and(
            eq(customers.customer_id, customerId),
            eq(customers.business_id, business_id)
        ))
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

export async function insertCustomer(data: NewCustomer){
    const [newCustomer] = await db
        .insert(customers)
        .values(data)
        .returning();
    return newCustomer; 
}