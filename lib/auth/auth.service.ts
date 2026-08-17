import type { Account, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { compare, hash } from "bcryptjs";
import { UserRepository } from "@/server/modules/user/user.repository";
import { db } from "@/server/database/client";
import { users } from "@/server/database/schemas/user";
import { randomBytes } from "crypto";
import { EmailService } from "../email/email.service";
import { AppError } from "@/server/lib/app-error";

const usersRepository = new UserRepository(db);

export class AuthService {
  static verifyCredentials = async (
    credentials: Partial<Record<"email" | "password", unknown>>,
  ) => {
    const email = credentials?.email as string | undefined;
    const password = credentials?.password as string | undefined;

    if (!email || !password) return null;

    const user = await usersRepository.findByEmailWithPassword(email);
    if (!user || !user.passwordHash) return null;

    const isValid = await compare(password, user.passwordHash);
    if (!isValid) return null;

    return { id: user.userId, email: user.email };
  };

  static handleOAuthSignIn = async (
    user: User,
    account: Account | null | undefined,
  ) => {
    if (account?.provider !== "google") {
      return true;
    }

    if (!user.email) {
      return false;
    }

    const existing = await usersRepository.findByEmail(user.email);
    if (!existing) {
      await db.insert(users).values({
        email: user.email,
        passwordHash: null,
      });
    }

    return true;
  };

  static handleJwt = async ({ token, user }: { token: JWT; user?: User }) => {
    if (user) {
      if (user.id) {
        const dbUser = await usersRepository.findById(user.id);
        if (dbUser) {
          token.id = dbUser.userId;
        }
      }

      if (!token.id && user.email) {
        const dbUser = await usersRepository.findByEmail(user.email);
        if (dbUser) {
          token.id = dbUser.userId;
        }
      }
    }
    return token;
  };
  static handleSession = ({
    session,
    token,
  }: {
    session: Session;
    token: JWT;
  }) => {
    if (token.id && session.user) {
      session.user.id = token.id as string;
    }
    return session;
  };

  static requestPasswordReset = async (email: string) => {
    const user = await usersRepository.findByEmail(email);

    // Always behave the same whether or not the user exists —
    // prevents leaking which emails are registered (user enumeration).
    if (!user) return;

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await usersRepository.setResetToken(user.userId, token, expires);

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await EmailService.sendPasswordReset(email, resetUrl);
  };

  static resetPassword = async (token: string, newPassword: string) => {
    const user = await usersRepository.findByResetToken(token);

    if (!user || !user.passwordResetExpires) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    if (user.passwordResetExpires < new Date()) {
      throw new AppError("Reset token has expired", 400);
    }

    const passwordHash = await hash(newPassword, 10);
    await usersRepository.resetPassword(user.userId, passwordHash);
  };
}
