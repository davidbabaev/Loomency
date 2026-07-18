import { employees } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export async function getEmployeeByUserId(userId: string){

    const result = await db
        .select()
        .from(employees)
        .where(eq(employees.user_id_betterauth, userId))
        .limit(1)

    return result[0]
} 