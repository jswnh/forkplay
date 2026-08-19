"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";

export interface UseStoreItemsParams {
  category?: string;
  gameId?: string;
  search?: string;
  rarity?: string;
  sortBy?: "featured" | "price_asc" | "price_desc" | "newest";
}

export function useStoreItems(params: UseStoreItemsParams = {}) {
  const { category, gameId, search, rarity, sortBy = "featured" } = params;

  return useQuery({
    queryKey: ["store-items", category, gameId, search, rarity, sortBy],
    queryFn: async () => {
      const res = await client.api.items.$get({
        query: {
          category: category && category !== "all" ? category : undefined,
          gameId: gameId || undefined,
          search: search && search.trim() ? search.trim() : undefined,
          rarity: rarity && rarity !== "all" ? rarity : undefined,
          sortBy,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch store items");
      }

      return res.json();
    },
  });
}

export function useItemDetails(idOrSlug: string | null, enabled = true) {
  return useQuery({
    queryKey: ["item-details", idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) return null;
      const res = await client.api.items[":idOrSlug"].$get({
        param: { idOrSlug },
      });

      if (!res.ok) {
        throw new Error("Failed to load store item details");
      }

      return res.json();
    },
    enabled: Boolean(idOrSlug && enabled),
  });
}

export function useCheckoutItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      paymentMethod,
    }: {
      itemId: string;
      paymentMethod?: string;
    }) => {
      const res = await (client.api.items.checkout.$post as any)({
        json: { itemId, paymentMethod },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to initialize item checkout");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
    },
  });
}

export function useVerifyItemPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ externalId }: { externalId: string }) => {
      const res = await (client.api.items["verify-payment"].$post as any)({
        json: { externalId },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to verify item transaction");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}
