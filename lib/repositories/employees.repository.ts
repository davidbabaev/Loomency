import { employees } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export async function getEmployees(userId: string){

    db
    .select()
    .from(employees)
    .where(eq(employees.user_id_betterauth, userId))
} 