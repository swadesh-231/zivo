"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { message, project, MessageRole, MessageType } from "@/db/schema";
import { getCurrentUser } from "@/features/auth/session";
import {
  dispatchBuild,
  INNGEST_UNREACHABLE,
  MAX_PROMPT_LENGTH,
} from "@/features/inngest/dispatch";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { guardBuild } from "@/lib/arcjet";
import { generateProjectName, normalizeProjectName } from "../lib";
import type { Project } from "@/db/schema";

export async function createProject(
  prompt: string,
): Promise<ActionResult<Project>> {
  const user = await getCurrentUser();

  if (!user) return fail("You need to sign in first.");

  const value = prompt.trim();

  if (!value) return fail("Describe what you want to build.");
  if (value.length > MAX_PROMPT_LENGTH) {
    return fail(`Keep the prompt under ${MAX_PROMPT_LENGTH} characters.`);
  }

  // Checked before anything is written: a build costs a sandbox and paid agent
  // iterations, so it is the surface worth rate limiting.
  const denied = await guardBuild(user.id, value);

  if (denied) return fail(denied.message);

  const projectId = crypto.randomUUID();

  try {
    const [[created]] = await db.batch([
      db
        .insert(project)
        .values({
          id: projectId,
          name: generateProjectName(),
          userId: user.id,
        })
        .returning(),
      db.insert(message).values({
        projectId,
        content: value,
        role: MessageRole.USER,
        type: MessageType.RESULT,
      }),
    ]);

    try {
      await dispatchBuild(created.id, value);
    } catch (error) {
      console.error("Failed to dispatch a build:", error);
      await db.delete(project).where(eq(project.id, created.id));

      return fail(INNGEST_UNREACHABLE);
    }

    revalidatePath("/dashboard");

    return ok(created);
  } catch (error) {
    console.error("Failed to create project:", error);
    return fail("Could not create the project. Please try again.");
  }
}

export async function getProjects(): Promise<ActionResult<Project[]>> {
  const user = await getCurrentUser();

  if (!user) return fail("You need to sign in first.");

  try {
    const rows = await db
      .select()
      .from(project)
      .where(eq(project.userId, user.id))
      .orderBy(desc(project.updatedAt));

    return ok(rows);
  } catch (error) {
    console.error("Failed to load projects:", error);
    return fail("Could not load your projects.");
  }
}

export async function getProject(id: string): Promise<ActionResult<Project>> {
  const user = await getCurrentUser();

  if (!user) return fail("You need to sign in first.");

  try {
    const [row] = await db
      .select()
      .from(project)
      .where(and(eq(project.id, id), eq(project.userId, user.id)))
      .limit(1);

    if (!row) return fail("Project not found.");

    return ok(row);
  } catch (error) {
    console.error("Failed to load project:", error);
    return fail("Could not load this project.");
  }
}

export async function renameProject(
  id: string,
  name: string,
): Promise<ActionResult<Project>> {
  const user = await getCurrentUser();

  if (!user) return fail("You need to sign in first.");

  const nextName = normalizeProjectName(name);

  if (!nextName) return fail("Give the project a name.");

  try {
    const [updated] = await db
      .update(project)
      .set({ name: nextName })
      .where(and(eq(project.id, id), eq(project.userId, user.id)))
      .returning();

    if (!updated) return fail("Project not found.");

    revalidatePath("/dashboard");
    revalidatePath(`/projects/${id}`);

    return ok(updated);
  } catch (error) {
    console.error("Failed to rename project:", error);
    return fail("Could not rename the project.");
  }
}

export async function deleteProject(id: string): Promise<ActionResult<string>> {
  const user = await getCurrentUser();

  if (!user) return fail("You need to sign in first.");

  try {
    const [deleted] = await db
      .delete(project)
      .where(and(eq(project.id, id), eq(project.userId, user.id)))
      .returning({ id: project.id });

    if (!deleted) return fail("Project not found.");

    revalidatePath("/dashboard");

    return ok(deleted.id);
  } catch (error) {
    console.error("Failed to delete project:", error);
    return fail("Could not delete the project.");
  }
}
