"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";

export interface InboxFilterOptions {
  category?: string;
  search?: string;
  isArchived?: boolean;
}

export function useInboxMessages(options: InboxFilterOptions = {}) {
  const { category = "all", search = "", isArchived = false } = options;

  return useQuery({
    queryKey: ["inbox", category, search, isArchived],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (category && category !== "all") queryParams.category = category;
      if (search && search.trim()) queryParams.search = search.trim();
      if (isArchived) queryParams.isArchived = "true";

      const res = await client.api.inbox.$get({
        query: queryParams as any,
      });

      if (!res.ok) return { messages: [], unreadCount: 0 };
      return res.json();
    },
  });
}

export function useInboxUnreadCount() {
  return useQuery({
    queryKey: ["inbox-unread-count"],
    queryFn: async () => {
      const res = await client.api.inbox["unread-count"].$get();
      if (!res.ok) return { unreadCount: 0 };
      return res.json();
    },
    refetchInterval: 15000,
  });
}

export function useInboxMessage(messageId: string | null, enabled = true) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["inbox-message", messageId],
    queryFn: async () => {
      if (!messageId) return null;
      const res = await client.api.inbox[":id"].$get({
        param: { id: messageId },
      });
      if (!res.ok) throw new Error("Message not found");
      const data = await res.json();

      // Invalidate unread count since viewing it automatically marks as read
      queryClient.invalidateQueries({ queryKey: ["inbox-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["user-session"] });

      return data;
    },
    enabled: Boolean(messageId && enabled),
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      isRead,
    }: {
      messageId: string;
      isRead: boolean;
    }) => {
      const res = await (client.api.inbox[":id"].read.$patch as any)({
        param: { id: messageId },
        json: { isRead },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to update message state");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
    },
  });
}

export function useMarkAllMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await client.api.inbox["read-all"].$patch();
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to mark all as read");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
    },
  });
}

export function useArchiveMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      isArchived,
    }: {
      messageId: string;
      isArchived: boolean;
    }) => {
      const res = await (client.api.inbox[":id"].archive.$patch as any)({
        param: { id: messageId },
        json: { isArchived },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to archive message");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-unread-count"] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const res = await client.api.inbox[":id"].$delete({
        param: { id: messageId },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to delete message");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
    },
  });
}

export function useComposeMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageData: {
      type?: string;
      title: string;
      body: string;
      metadata?: any;
    }) => {
      const res = await (client.api.inbox.compose.$post as any)({
        json: messageData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to compose message");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["user-session"] });
    },
  });
}
