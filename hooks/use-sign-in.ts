// src/hooks/use-sign-in.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";

type SignInInput = {
  email: string;
  password: string;
};

export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: SignInInput) => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      return result;
    },
  });
}
