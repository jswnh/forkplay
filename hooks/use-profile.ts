"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";

export function useProfileData() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await client.api.profile.$get();
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
  });
}
