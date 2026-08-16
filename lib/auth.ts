import NextAuth, { Account, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
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
}

const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: (credentials) => AuthService.verifyCredentials(credentials),
    }),
    Google,
  ],
  callbacks: {
    signIn: ({ user, account }) => AuthService.handleOAuthSignIn(user, account),
  },
});

export class AuthController {
  static handlers = handlers;
  static getSession = () => auth();
  static signIn = (...args: Parameters<typeof signIn>) => signIn(...args);
  static signOut = (...args: Parameters<typeof signOut>) => signOut(...args);
}
