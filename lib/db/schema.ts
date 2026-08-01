import { sql } from "drizzle-orm";
import { integer, text, pgTable, timestamp, unique, pgEnum, check } from "drizzle-orm/pg-core";

export const senderTypeEnum = pgEnum('sender_type', ['customer', 'employee', 'agent']);

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
    business_id: integer().references(() => businesses.business_id).notNull(),
    customer_name: text(),
    customer_lastname: text(),
    phone_number: text(),
    created_at: timestamp().defaultNow(),
})

export const employees = pgTable("employees", {
    user_id_betterauth: text(),
    employee_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    business_id: integer().references(() => businesses.business_id).notNull(),
    created_at: timestamp().defaultNow(),
    role: text()
},
    (table) => [
        unique().on(table.user_id_betterauth, table.business_id)
    ] 
)

export const conversations = pgTable("conversations", {
    customer_id: integer().references(() => customers.customer_id),
    business_id: integer().references(() => businesses.business_id).notNull(),
    conversation_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    created_at: timestamp().defaultNow(),
})

export const messages = pgTable("messages", {
    conversation_id: integer().references(() => conversations.conversation_id).notNull(),
    business_id: integer().references(() => businesses.business_id).notNull(),
    message_text: text(),
    message_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    sender_type: senderTypeEnum().notNull(),
    sender_customer_id: integer().references(() => customers.customer_id),
    sender_employee_id: integer().references(() => employees.employee_id),
    message_media_url: text(),
    message_media_type: text(),
    created_at: timestamp().defaultNow(),
}, (table) => [
    check(
        "sender_matches_type",
        sql`
            (${table.sender_type} = 'customer' AND ${table.sender_customer_id} IS NOT NULL AND ${table.sender_employee_id} IS NULL)
            OR (${table.sender_type} = 'employee' AND ${table.sender_employee_id} IS NOT NULL AND ${table.sender_customer_id} IS NULL)
            OR (${table.sender_type} = 'agent' AND ${table.sender_customer_id} IS NULL AND ${table.sender_employee_id} IS NULL)
        `
    )
]);