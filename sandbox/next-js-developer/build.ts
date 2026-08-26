import "dotenv/config";
import { defaultBuildLogger, Template } from "e2b";

import { name } from "./package.json";
import { template } from "./template";

/**
 * The alias sandboxes are created from. `src/features/inngest/functions.ts`
 * resolves the same name, so the two stay in step through E2B_TEMPLATE_ID.
 */
export const TEMPLATE_NAME = name;

/**
 * Building under a `-dev` alias lets you try template changes without
 * repointing the running app at a half-built image.
 */
export async function buildTemplate({ dev = false } = {}) {
  const apiKey = process.env.E2B_API_KEY;

  if (!apiKey) {
    console.error("E2B_API_KEY is not set. Add it to .env and try again.");
    process.exit(1);
  }

  const templateName = dev ? `${TEMPLATE_NAME}-dev` : TEMPLATE_NAME;

  console.log(`Building E2B template "${templateName}"…`);

  try {
    const { templateId } = await Template.build(template, templateName, {
      cpuCount: 4,
      memoryMB: 4096,
      onBuildLogs: defaultBuildLogger(),
      apiKey,
    });

    console.log(`\nBuilt "${templateName}" (${templateId}).`);

    if (dev) {
      console.log(`Point the app at it with E2B_TEMPLATE_ID=${templateName}`);
    }
  } catch (error) {
    console.error(
      `\nFailed to build "${templateName}":`,
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}
