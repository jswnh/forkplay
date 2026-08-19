"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";

export interface GamesFilterOptions {
  tab?: string;
  genre?: string;
  search?: string;
  sortBy?: string;
}

export function useGamesList(options: GamesFilterOptions = {}) {
  const { tab = "all", genre = "All", search = "", sortBy } = options;

  return useQuery({
    queryKey: ["games", tab, genre, search, sortBy],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (tab && tab !== "all") queryParams.tab = tab;
      if (genre && genre !== "All") queryParams.genre = genre;
      if (search && search.trim()) queryParams.search = search.trim();
      if (sortBy) queryParams.sortBy = sortBy;

      const res = await client.api.games.$get({
        query: queryParams as any,
      });

      if (!res.ok) throw new Error("Failed to load games");
      return res.json();
    },
  });
}

export function useFeaturedGame() {
  return useQuery({
    queryKey: ["featured-game"],
    queryFn: async () => {
      const res = await client.api.games.featured.$get();
      if (!res.ok) return { game: null };
      return res.json();
    },
  });
}

export function useGameDetails(slugOrId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["game-details", slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;
      const res = await client.api.games[":idOrSlug"].$get({
        param: { idOrSlug: slugOrId },
      });
      if (!res.ok) throw new Error("Game not found");
      return res.json();
    },
    enabled: Boolean(slugOrId && enabled),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      const res = await client.api.games[":id"].favorite.$post({
        param: { id: gameId },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to update favorite status");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["featured-game"] });
      queryClient.invalidateQueries({ queryKey: ["game-details"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useRecordPlaySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      minutes = 30,
    }: {
      gameId: string;
      minutes?: number;
    }) => {
      const res = await (client.api.games[":id"].play.$post as any)({
        param: { id: gameId },
        json: { minutes },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to record play session");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useAddToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      const res = await client.api.games[":id"]["add-to-library"].$post({
        param: { id: gameId },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to add game to library");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
