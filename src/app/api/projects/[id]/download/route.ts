import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { fragment, message, project } from "@/db/schema";
import { guardDownload } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { createZip } from "@/lib/zip";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * `fragment.id` is a uuid column, so a malformed value does not come back empty
 * — Postgres raises `invalid input syntax for type uuid` and the route 500s on
 * what is really a bad request. Anything that is not a uuid is treated as no
 * selection at all, which lands on the same default as omitting it.
 */
function readFragmentId(request: Request) {
  const value = new URL(request.url).searchParams.get("fragment");

  return value && UUID.test(value) ? value : null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const denied = await guardDownload(request, session.user.id);

  if (denied) {
    return NextResponse.json(
      { error: denied.message },
      { status: denied.status },
    );
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

  // Scoped to the project either way, so a fragment id belonging to someone
  // else's project simply finds nothing.
  const fragmentId = readFragmentId(request);

  const [selected] = await db
    .select({ files: fragment.files })
    .from(fragment)
    .innerJoin(message, eq(message.id, fragment.messageId))
    .where(
      fragmentId
        ? and(eq(message.projectId, id), eq(fragment.id, fragmentId))
        : eq(message.projectId, id),
    )
    .orderBy(desc(fragment.createdAt))
    .limit(1);

  const files = selected?.files ?? {};
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
