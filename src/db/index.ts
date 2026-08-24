import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { requiredEnv } from "@/lib/env";

const sql = neon(requiredEnv("DATABASE_URL"));

export const db = drizzle({ client: sql });
