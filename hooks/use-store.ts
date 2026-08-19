"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";

export interface StoreFilterOptions {
  genre?: string;
  priceFilter?: string;
  search?: string;
  sortBy?: string;
}

export function useStoreGames(options: StoreFilterOptions = {}) {
  const { genre = "All", priceFilter = "all", search = "", sortBy = "featured" } = options;

  return useQuery({
    queryKey: ["store", genre, priceFilter, search, sortBy],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (genre && genre !== "All") queryParams.genre = genre;
      if (priceFilter && priceFilter !== "all") queryParams.priceFilter = priceFilter;
      if (search && search.trim()) queryParams.search = search.trim();
      if (sortBy) queryParams.sortBy = sortBy;

      const res = await client.api.store.$get({
        query: queryParams as any,
      });

      if (!res.ok) return { games: [] };
      return res.json();
    },
  });
}

export function usePurchaseGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      paymentMethod = "Platform Credits",
    }: {
      gameId: string;
      paymentMethod?: string;
    }) => {
      const res = await (client.api.store.purchase.$post as any)({
        json: { gameId, paymentMethod },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as any).message || "Checkout failed");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store"] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useCheckoutXendit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId }: { gameId: string }) => {
      const res = await (client.api.store["checkout-xendit"].$post as any)({
        json: { gameId },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as any).message || "Failed to initialize Xendit checkout");
      }
      return data;
    },
    onSuccess: (data: any) => {
      if (data.alreadyOwned || !data.isPending) {
        queryClient.invalidateQueries({ queryKey: ["store"] });
        queryClient.invalidateQueries({ queryKey: ["games"] });
        queryClient.invalidateQueries({ queryKey: ["inbox"] });
      }
    },
  });
}

export function useVerifyXendit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ externalId }: { externalId: string }) => {
      const res = await (client.api.store["verify-xendit"].$post as any)({
        json: { externalId },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error((data as any).message || "Verification failed");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store"] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}
