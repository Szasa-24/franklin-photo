import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

export default defineConfig(
  connectionString
    ? {
        schema: "./src/db/schema.ts",
        out: "./drizzle",
        dialect: "postgresql",
        schemaFilter: ["public"],
        dbCredentials: {
          url: connectionString,
        },
        verbose: true,
      }
    : {
        schema: "./src/db/schema.ts",
        out: "./drizzle",
        dialect: "postgresql",
        schemaFilter: ["public"],
        dbCredentials: {
          host: process.env.SQL_HOST!,
          user: process.env.SQL_ADMIN_USER!,
          password: process.env.SQL_ADMIN_PASSWORD!,
          database: process.env.SQL_DB_NAME!,
          ssl: false,
        },
        verbose: true,
      }
);
