import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type * as schema from "./schema";

export type Transaction = PgTransaction<
    NeonQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
>;