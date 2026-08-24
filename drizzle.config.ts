import "dotenv/config";
import { defineConfig } from "drizzle-kit";
const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: { url },
});
