import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { businessHours, DayOfWeek } from "../db/schema";

export async function getBusinessHoursForDayRepo(business_id: number, day: DayOfWeek) {
    const result = await db
        .select()
        .from(businessHours)
        .where(and(
            eq(businessHours.business_id, business_id),
            eq(businessHours.day, day),
        ))
        .limit(1);
    return result[0];
}