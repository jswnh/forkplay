import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { AuthService } from "./auth.service";
import { UserRepository } from "@/server/modules/user/user.repository";
import { db } from "@/server/database/client";

const usersRepository = new UserRepository(db);

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
    jwt: (params) => AuthService.handleJwt(params),
    session: (params) => AuthService.handleSession(params),
  },
});

export class AuthController {
  static handlers = handlers;
  static getSession = () => auth();
  static signIn = (...args: Parameters<typeof signIn>) => signIn(...args);
  static signOut = (...args: Parameters<typeof signOut>) => signOut(...args);

  static getCurrentUser = async () => {
    const session = await auth();
    if (!session?.user?.id) return null;

    return usersRepository.findById(session.user.id);
  };
}
