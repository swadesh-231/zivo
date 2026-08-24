import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

import { guardAuth } from "@/lib/arcjet";
import { auth } from "@/lib/auth";

const handlers = toNextJsHandler(auth);

async function guarded(
  handler: (request: Request) => Promise<Response>,
  request: Request,
) {
  const denied = await guardAuth(request);

  if (denied) {
    return NextResponse.json(
      { error: denied.message },
      { status: denied.status },
    );
  }

  return handler(request);
}

export const GET = (request: Request) => guarded(handlers.GET, request);
export const POST = (request: Request) => guarded(handlers.POST, request);
