import { DbClient } from "@/server/database/client";
import {
  inboxMessages,
  NewInboxMessage,
} from "@/server/database/schemas/inbox-message";
import { eq, and, desc, sql, or, ilike } from "drizzle-orm";

export interface ListInboxFilter {
  category?: string; // all, unread, mentions, system, game, social, store, achievement, announcement
  search?: string;
  isArchived?: boolean;
}

export class InboxRepository {
  constructor(private db: DbClient) {}

  async listMessages(userId: string, filter: ListInboxFilter = {}) {
    const { category = "all", search, isArchived = false } = filter;

    const conditions = [
      eq(inboxMessages.userId, userId),
      eq(inboxMessages.isDeleted, false),
      eq(inboxMessages.isArchived, isArchived),
    ];

    if (category === "unread") {
      conditions.push(eq(inboxMessages.isRead, false));
    } else if (category === "mentions") {
      conditions.push(eq(inboxMessages.type, "mention"));
    } else if (
      category !== "all" &&
      [
        "system",
        "game",
        "social",
        "store",
        "achievement",
        "announcement",
      ].includes(category)
    ) {
      conditions.push(
        eq(inboxMessages.type, category as "system" | "game" | "social" | "mention" | "achievement" | "store" | "announcement"),
      );
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      const searchCond = or(
        ilike(inboxMessages.title, term),
        ilike(inboxMessages.body, term),
        ilike(inboxMessages.senderName, term),
      );
      if (searchCond) {
        conditions.push(searchCond);
      }
    }

    return await this.db
      .select()
      .from(inboxMessages)
      .where(and(...conditions))
      .orderBy(desc(inboxMessages.createdAt));
  }

  async getUnreadCount(userId: string) {
    const [result] = await this.db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(inboxMessages)
      .where(
        and(
          eq(inboxMessages.userId, userId),
          eq(inboxMessages.isRead, false),
          eq(inboxMessages.isDeleted, false),
        ),
      );

    return result?.count ?? 0;
  }

  async getMessageById(userId: string, messageId: string, autoMarkRead = true) {
    const [message] = await this.db
      .select()
      .from(inboxMessages)
      .where(
        and(
          eq(inboxMessages.messageId, messageId),
          eq(inboxMessages.userId, userId),
          eq(inboxMessages.isDeleted, false),
        ),
      )
      .limit(1);

    if (!message) return null;

    if (autoMarkRead && !message.isRead) {
      await this.db
        .update(inboxMessages)
        .set({ isRead: true, readAt: new Date(), updatedAt: new Date() })
        .where(eq(inboxMessages.messageId, messageId));
      message.isRead = true;
      message.readAt = new Date();
    }

    return message;
  }

  async setReadStatus(userId: string, messageId: string, isRead: boolean) {
    const [updated] = await this.db
      .update(inboxMessages)
      .set({
        isRead,
        readAt: isRead ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(inboxMessages.messageId, messageId),
          eq(inboxMessages.userId, userId),
        ),
      )
      .returning();

    return updated ?? null;
  }

  async markAllAsRead(userId: string) {
    await this.db
      .update(inboxMessages)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(inboxMessages.userId, userId),
          eq(inboxMessages.isRead, false),
          eq(inboxMessages.isDeleted, false),
        ),
      );

    return { success: true };
  }

  async setArchivedStatus(
    userId: string,
    messageId: string,
    isArchived: boolean,
  ) {
    const [updated] = await this.db
      .update(inboxMessages)
      .set({
        isArchived,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(inboxMessages.messageId, messageId),
          eq(inboxMessages.userId, userId),
        ),
      )
      .returning();

    return updated ?? null;
  }

  async deleteMessage(userId: string, messageId: string) {
    const [deleted] = await this.db
      .update(inboxMessages)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(inboxMessages.messageId, messageId),
          eq(inboxMessages.userId, userId),
        ),
      )
      .returning();

    return deleted ?? null;
  }

  async createMessage(data: NewInboxMessage) {
    const [created] = await this.db
      .insert(inboxMessages)
      .values(data)
      .returning();

    return created;
  }
}
