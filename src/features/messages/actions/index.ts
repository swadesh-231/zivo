"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  buildEvent,
  fragment,
  message,
  project,
  MessageRole,
  MessageType,
  type BuildEvent,
  type Fragment,
  type Message,
} from "@/db/schema";
import { getCurrentUser } from "@/features/auth/session";
import {
  dispatchBuild,
  INNGEST_UNREACHABLE,
  MAX_PROMPT_LENGTH,
} from "@/features/inngest/dispatch";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { guardBuild } from "@/lib/arcjet";

export type ProjectMessage = Message & { fragment: Fragment | null };

async function assertProjectAccess(projectId: string) {
  const user = await getCurrentUser();

  if (!user) return null;

  const [row] = await db
    .select({ id: project.id })
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.userId, user.id)))
    .limit(1);

  return row ? user : null;
}

export async function getMessages(
  projectId: string,
): Promise<ActionResult<ProjectMessage[]>> {
  const user = await assertProjectAccess(projectId);

  if (!user) return fail("Project not found.");

  try {
    const rows = await db
      .select({ message, fragment })
      .from(message)
      .leftJoin(fragment, eq(fragment.messageId, message.id))
      .where(eq(message.projectId, projectId))
      .orderBy(asc(message.createdAt));

    return ok(rows.map((row) => ({ ...row.message, fragment: row.fragment })));
  } catch (error) {
    console.error("Failed to load messages:", error);
    return fail("Could not load this conversation.");
  }
}

export async function createMessage(
  projectId: string,
  prompt: string,
): Promise<ActionResult<Message>> {
  const user = await assertProjectAccess(projectId);

  if (!user) return fail("Project not found.");

  const value = prompt.trim();

  if (!value) return fail("Describe the change you want.");
  if (value.length > MAX_PROMPT_LENGTH) {
    return fail(`Keep the prompt under ${MAX_PROMPT_LENGTH} characters.`);
  }

  // Every follow-up message triggers another full build.
  const denied = await guardBuild(user.id, value);

  if (denied) return fail(denied.message);

  try {
    const [created] = await db
      .insert(message)
      .values({
        projectId,
        content: value,
        role: MessageRole.USER,
        type: MessageType.RESULT,
      })
      .returning();

    try {
      await dispatchBuild(projectId, value);
    } catch (error) {
      console.error("Failed to dispatch a build:", error);
      await db.delete(message).where(eq(message.id, created.id));

      return fail(INNGEST_UNREACHABLE);
    }

    await db
      .update(project)
      .set({ updatedAt: new Date() })
      .where(eq(project.id, projectId));

    // The row above just moved this project to the top of the dashboard, and
    // its "Updated ..." label changed.
    revalidatePath("/dashboard");

    return ok(created);
  } catch (error) {
    console.error("Failed to create message:", error);
    return fail("Could not send that message. Please try again.");
  }
}

export async function getBuildEvents(
  projectId: string,
): Promise<ActionResult<BuildEvent[]>> {
  const user = await assertProjectAccess(projectId);

  if (!user) return fail("Project not found.");

  try {
    const rows = await db
      .select()
      .from(buildEvent)
      .where(eq(buildEvent.projectId, projectId))
      .orderBy(asc(buildEvent.createdAt));

    return ok(rows);
  } catch (error) {
    console.error("Failed to load build events:", error);
    return fail("Could not load build progress.");
  }
}
