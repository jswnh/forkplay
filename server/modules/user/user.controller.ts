import { hash } from "bcryptjs";
import { AppError } from "@/server/lib/app-error";
import type { AppContext, AppVariables } from "../../context";
import { UserRepository } from "./user.repository";
import { db } from "@/server/database/client";
import { users } from "@/server/database/schemas/user";
import { AuthController, AuthService } from "@/lib/auth";

const usersRepository = new UserRepository(db);

export class UserController {
  async signUp(ctx: AppContext) {
    const { email, password } = await ctx.req.json();

    const existing = await usersRepository.findByEmail(email);
    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    const passwordHash = await hash(password, 10);
    await db.insert(users).values({ email, passwordHash });

    return ctx.json({ success: true }, 201);
  }

  async session(ctx: AppContext) {
    const session = ctx.get("session");
    const user = await AuthController.getCurrentUser();
    return ctx.json({ session, user });
  }

  async signOut(ctx: AppContext) {
    await AuthController.signOut({ redirect: false });
    return ctx.json({ success: true });
  }

  forgotPassword = async (c: AppContext) => {
    const body = await c.req.json();

    await AuthService.requestPasswordReset(body.email);

    return c.json({
      message: "If that email is registered, a reset link has been sent.",
    });
  };

  resetPassword = async (c: AppContext) => {
    const body = await c.req.json();

    await AuthService.resetPassword(body.token, body.password);

    return c.json({ success: true });
  };
}
