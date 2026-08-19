"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { signOut } from "next-auth/react";

export function useUserSession() {
  return useQuery({
    queryKey: ["user-session"],
    queryFn: async () => {
      const res = await client.api.user.session.$get();
      if (!res.ok) return { user: null, stats: null };
      return res.json();
    },
  });
}

export function useCheckUsername(username: string) {
  return useQuery({
    queryKey: ["check-username", username],
    queryFn: async () => {
      if (!username || username.trim().length < 3) {
        return { available: false, message: "Username must be at least 3 characters" };
      }
      const res = await client.api.user["check-username"].$get({
        query: { username: username.trim() },
      });
      return res.json();
    },
    enabled: Boolean(username && username.trim().length >= 3),
  });
}

export function useSetUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      const res = await client.api.user.username.$post({
        json: { username },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as any).message || "Failed to set username");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: {
      displayName?: string;
      bio?: string;
      avatarUrl?: string;
      bannerUrl?: string;
    }) => {
      const res = await client.api.user.profile.$patch({
        json: profileData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as any).message || "Failed to update profile");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const res = await (client.api.user["change-password"].$post as any)({
        json: { currentPassword, newPassword },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as any).message || "Failed to update password");
      }
      return data;
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await (client.api.user["verify-email"].$get as any)({
        query: { token },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to verify email identity");
      }
      return data;
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await (client.api.user["resend-verification"].$post as any)({
        json: { email },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to dispatch verification email");
      }
      return data;
    },
  });
}

export function useSignOutUser() {
  return useMutation({
    mutationFn: async () => {
      await signOut({ redirect: false });
    },
  });
}
