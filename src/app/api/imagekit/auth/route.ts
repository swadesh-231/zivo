import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { guardUpload } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { createUploadAuth, isImageKitConfigured } from "@/lib/imagekit";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const denied = await guardUpload(request, session.user.id);

  if (denied) {
    return NextResponse.json(
      { error: denied.message },
      { status: denied.status },
    );
  }

  if (!isImageKitConfigured()) {
    return NextResponse.json(
      {
        error:
          "Image uploads are not configured. Set IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY.",
      },
      { status: 503 },
    );
  }

  try {
    return NextResponse.json(createUploadAuth(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to create ImageKit upload auth:", error);

    return NextResponse.json(
      { error: "Could not prepare the upload." },
      { status: 500 },
    );
  }
}
