"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";

export interface AchievementsFilterOptions {
  gameId?: string;
  status?: string;
  search?: string;
}

export function useAchievementsList(options: AchievementsFilterOptions = {}) {
  const { gameId = "all", status = "all", search = "" } = options;

  return useQuery({
    queryKey: ["achievements", gameId, status, search],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (gameId && gameId !== "all") queryParams.gameId = gameId;
      if (status && status !== "all") queryParams.status = status;
      if (search && search.trim()) queryParams.search = search.trim();

      const res = await client.api.achievements.$get({
        query: queryParams as any,
      });

      if (!res.ok) {
        return {
          achievements: [],
          stats: {
            totalAchievements: 0,
            unlockedCount: 0,
            lockedCount: 0,
            completionPercentage: 0,
            totalPoints: 0,
            earnedPoints: 0,
          },
          recentlyUnlocked: [],
        };
      }

      return res.json();
    },
  });
}

export function useUnlockAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (achievementId: string) => {
      const res = await client.api.achievements[":id"].unlock.$post({
        param: { id: achievementId },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as any).message || "Failed to unlock achievement");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
