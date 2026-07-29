import {loadEnvConfig} from "@next/env"
import {defineConfig} from "drizzle-kit"

loadEnvConfig(process.cwd());

export default defineConfig({
    schema: "./lib/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    tablesFilter: ['!user', '!session', '!account', '!verification', '*'],
    dbCredentials: {
        url: process.env.DATABASE_URL!
    }
})