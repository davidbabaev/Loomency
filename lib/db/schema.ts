import { integer, text, pgTable, timestamp } from "drizzle-orm/pg-core";

export const businesses = pgTable("businesses", {
    business_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    business_name: text(),
    country: text(),
    address: text(),
    field: text(),
    phone_number: text(),
    created_at: timestamp().defaultNow(),
});

export const customers = pgTable("customers", {
    customer_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    customer_name: text(),
    customer_lastname: text(),
    phone_number: text(),
    created_at: timestamp().defaultNow(),
})

export const employees = pgTable("employees", {
    user_id_betterauth: text(),
    business_id: integer().references(() => businesses.business_id),
    created_at: timestamp().defaultNow(),
    role: text()
})

export const conversations = pgTable("conversations", {
    conversation_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    business_id: integer().references(() => businesses.business_id),
    created_at: timestamp().defaultNow(),
})