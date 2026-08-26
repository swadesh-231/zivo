import "server-only";

import { inngest } from "./client";
import { BUILD_EVENT_NAME } from "./constants";

export async function dispatchBuild(projectId: string, value: string) {
  await inngest.send({
    name: BUILD_EVENT_NAME,
    data: { value, projectId },
  });
}
