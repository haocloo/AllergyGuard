import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

declare global {
  var postgresSqlClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL!;

let postgresSqlClient: ReturnType<typeof postgres>;

if (process.env.NODE_ENV !== "production") {
  if (!global.postgresSqlClient) {
    // Disable prefetch as it is not supported for "Transaction" pool mode
    global.postgresSqlClient = postgres(connectionString, { prepare: false });
  }
  postgresSqlClient = global.postgresSqlClient;
} else {
  postgresSqlClient = postgres(connectionString, { prepare: false });
}

// Define the correct type for your database
export type MyDatabase = PostgresJsDatabase<typeof schema>;

// Initialize the database with the correct schema
export const db: MyDatabase = drizzle(postgresSqlClient, { logger: true, schema });

