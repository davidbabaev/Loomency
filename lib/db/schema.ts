import { integer, text, pgTable, timestamp, unique } from "drizzle-orm/pg-core";

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
    employee_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    business_id: integer().references(() => businesses.business_id),
    created_at: timestamp().defaultNow(),
    role: text()
},
    (table) => [
        unique().on(table.user_id_betterauth, table.business_id)
    ]
)

export const conversations = pgTable("conversations", {
    customer_id: integer().references(() => customers.customer_id),
    business_id: integer().references(() => businesses.business_id),
    conversation_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    created_at: timestamp().defaultNow(),
})

export const messages = pgTable("messages", {
    conversation_id: integer().references(() => conversations.conversation_id),
    business_id: integer().references(() => businesses.business_id),
    message_text: text(),
    message_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    sender_user_id: integer().references(() => customers.customer_id),
    sender_business_user_id: integer().references(() => employees.employee_id),
    message_media_url: text(),
    message_media_type: text(),
    created_at: timestamp().defaultNow(),
}) 