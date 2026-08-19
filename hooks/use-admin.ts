"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await (client.api.admin.stats.$get as any)();
      if (!res.ok) throw new Error("Failed to load platform telemetry");
      return res.json();
    },
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameData: any) => {
      const res = await (client.api.admin.games.$post as any)({
        json: gameData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to deploy new title");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["store"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await (client.api.admin.games[":id"].$patch as any)({
        param: { id },
        json: data,
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Failed to update title");
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["store"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      const res = await (client.api.admin.games[":id"].$delete as any)({
        param: { id: gameId },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to decommission title");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["store"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useCreateStoreItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemData: any) => {
      const res = await (client.api.admin.items.$post as any)({
        json: itemData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to deploy store item");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-items"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useUpdateStoreItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await (client.api.admin.items[":id"].$patch as any)({
        param: { id },
        json: data,
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Failed to update item");
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-items"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useDeleteStoreItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const res = await (client.api.admin.items[":id"].$delete as any)({
        param: { id: itemId },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete item");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-items"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (achData: any) => {
      const res = await (client.api.admin.achievements.$post as any)({
        json: achData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create achievement");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await (client.api.admin.achievements[":id"].$patch as any)({
        param: { id },
        json: data,
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Failed to update achievement");
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (achievementId: string) => {
      const res = await (client.api.admin.achievements[":id"].$delete as any)({
        param: { id: achievementId },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete achievement");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useBroadcastAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (broadcastData: {
      title: string;
      body: string;
      actionUrl?: string;
      actionLabel?: string;
    }) => {
      const res = await (client.api.admin.broadcast.$post as any)({
        json: broadcastData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to dispatch broadcast");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}
