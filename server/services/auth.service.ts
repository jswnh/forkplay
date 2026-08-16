import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { UserRepository } from "../modules/user/user.repository";
import { db } from "../database/client";
import { compare } from "bcryptjs";

const usersRepository = new UserRepository(db);

export class AuthService {
  private static usersRepository = usersRepository;

  static verifyCredentials = async (
    credentials: Partial<Record<"email" | "password", unknown>>,
  ) => {
    const email = credentials?.email as string | undefined;
    const password = credentials?.password as string | undefined;

    if (!email || !password) {
      return null;
    }

    const user = await AuthService.usersRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return { id: user.userId, email: user.email };
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
  ],
});

export class AuthController {
  static handlers = handlers;
  static getSession = () => auth();
  static signIn = (...args: Parameters<typeof signIn>) => signIn(...args);
  static signOut = (...args: Parameters<typeof signOut>) => signOut(...args);
}
