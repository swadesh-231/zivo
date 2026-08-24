import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { fragment, message, project } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createZip } from "@/lib/zip";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [row] = await db
    .select({ name: project.name })
    .from(project)
    .where(and(eq(project.id, id), eq(project.userId, session.user.id)))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const [latest] = await db
    .select({ files: fragment.files })
    .from(fragment)
    .innerJoin(message, eq(message.id, fragment.messageId))
    .where(eq(message.projectId, id))
    .orderBy(desc(fragment.createdAt))
    .limit(1);

  const files = latest?.files ?? {};
  const entries = Object.entries(files).map(([path, content]) => ({
    path,
    content,
  }));

  if (entries.length === 0) {
    return NextResponse.json(
      { error: "This project has no generated files yet" },
      { status: 404 },
    );
  }

  const archive = createZip(entries);
  const filename = `${slugify(row.name) || "zivo-project"}.zip`;

  return new NextResponse(new Uint8Array(archive), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(archive.length),
      "Cache-Control": "no-store",
    },
  });
}
