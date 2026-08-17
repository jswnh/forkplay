import type { Account, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { compare } from "bcryptjs";
import { UserRepository } from "@/server/modules/user/user.repository";
import { db } from "@/server/database/client";
import { users } from "@/server/database/schemas/user";

const usersRepository = new UserRepository(db);

export class AuthService {
  static verifyCredentials = async (
    credentials: Partial<Record<"email" | "password", unknown>>,
  ) => {
    const email = credentials?.email as string | undefined;
    const password = credentials?.password as string | undefined;

    if (!email || !password) return null;

    const user = await usersRepository.findByEmail(email);
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

  static handleJwt = async ({
    token,
    user,
    account,
  }: {
    token: JWT;
    user?: User;
    account?: Account | null;
  }) => {
    if (user) {
      if (account?.provider === "google") {
        const dbUser = await usersRepository.findByEmail(user.email!);
        if (dbUser) {
          token.id = dbUser.userId;
        }
      } else {
        token.id = user.id;
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
}
