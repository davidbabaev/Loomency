import { employees } from "../db/schema";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { user } from "../db/auth-schema";

type NewEmployee = typeof employees.$inferInsert;

export async function getEmployeeByUserId(userId: string){

    const result = await db
        .select()
        .from(employees)
        .where(eq(employees.user_id_betterauth, userId))
        .limit(1)

    return result[0]
} 

export async function getUserByEmail(email: string){
    const result = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1)
    return result[0];
}

export async function insertEmployee(data: NewEmployee, tx = db){
    const [newEmployee] = await tx  
        .insert(employees)
        .values(data)
        .returning();
    return newEmployee;
}

export async function getUserById(id: string){
    const result = await db
        .select()
        .from(user)
        .where(eq(user.id, id))
        .limit(1)
    return result[0];
}

export async function getEmployeeByUserAndBusiness(
    userId: string, 
    business_id: number
){
    const result = await db
        .select()
        .from(employees)
        .where(and(
            eq(employees.user_id_betterauth, userId),
            eq(employees.business_id, business_id),
        ))
        .limit(1)
    return result[0];
}