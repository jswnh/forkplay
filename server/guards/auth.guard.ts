import type { Next } from "hono";
import { AppContext } from "../context";
import { AuthController } from "@/lib/auth";
import { AppError } from "../lib/app-error";

export class AuthGuard {
  static canActivate = async (c: AppContext, next: Next) => {
    const session = await AuthController.getSession();

    if (!session) {
      throw new AppError("Unauthorized", 401);
    }

    c.set("session", session);
    await next();
  };
}
