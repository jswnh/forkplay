import type { Context } from "hono";
import { hash } from "bcryptjs";
import { AppError } from "@/server/lib/app-error";
import type { AppVariables } from "../../context";
import { UserRepository } from "./user.repository";
import { db } from "@/server/database/client";
import { users } from "@/server/database/schemas/user";

const usersRepository = new UserRepository(db);

export class UserController {
  async signUp(c: Context<{ Variables: AppVariables }>) {
    const { email, password } = await c.req.json();

    const existing = await usersRepository.findByEmail(email);
    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    const passwordHash = await hash(password, 10);
    await db.insert(users).values({ email, passwordHash });

    return c.json({ success: true }, 201);
  }
}
