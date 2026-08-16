import app from "@/server";
import type { ExecutionContext } from "hono";

async function handler(request: Request): Promise<Response> {
  const env = {};
  const context: ExecutionContext | undefined = undefined;

  return app.fetch(request, env, context);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
