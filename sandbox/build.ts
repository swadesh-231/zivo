import dotenv from "dotenv";
import { Template, defaultBuildLogger } from "e2b";

import { template } from "./template";

dotenv.config();

const templateId = process.env.E2B_TEMPLATE_ID ?? "c0-build";
const apiKey = process.env.E2B_API_KEY;

if (!apiKey) {
  console.error("E2B_API_KEY is not set. Add it to .env and try again.");
  process.exit(1);
}

try {
  await Template.build(template, templateId, {
    cpuCount: 4,
    memoryMB: 4096,
    onBuildLogs: defaultBuildLogger(),
    apiKey,
  });

  console.log(`Built E2B template "${templateId}".`);
} catch (error) {
  console.error(
    `Failed to build E2B template "${templateId}":`,
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}
