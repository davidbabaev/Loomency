import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: text().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: boolean().notNull(),
    image: text(),
    createdAt: timestamp({withTimezone: true}).notNull(),
    updatedAt: timestamp({withTimezone: true}).notNull(),
})