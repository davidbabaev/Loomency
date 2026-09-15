import { employees } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
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

export async function insertEmployee(data: NewEmployee){
    const [newEmployee] = await db  
        .insert(employees)
        .values(data)
        .returning();
    return newEmployee;
}