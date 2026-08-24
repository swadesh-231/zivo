import dotenv from "dotenv";
import { Template, defaultBuildLogger } from "e2b";

import { template } from "./template";

dotenv.config();

Template.build(template, process.env.E2B_TEMPLATE_ID ?? "c0-build", {
  cpuCount: 4,
  memoryMB: 4096,
  onBuildLogs: defaultBuildLogger(),
  apiKey: process.env.E2B_API_KEY,
});
