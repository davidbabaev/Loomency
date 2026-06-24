import { integer, pgTable } from "drizzle-orm/pg-core";


export const businesses = pgTable("businesses", {
    business_id: integer().primaryKey().generatedAlwaysAsIdentity(),
});