import { pgTable, uuid, text, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./user";

export const messageTypeEnum = pgEnum("message_type", [
  "system",
  "game",
  "social",
  "mention",
  "achievement",
  "store",
  "announcement",
]);

export interface InboxMetadata {
  gameId?: string;
  gameTitle?: string;
  gameSlug?: string;
  actionUrl?: string;
  actionLabel?: string;
  achievementId?: string;
  achievementTitle?: string;
  achievementIcon?: string;
  rewardPoints?: number;
  tags?: string[];
  [key: string]: unknown;
}

export const inboxMessages = pgTable("inbox_messages", {
  messageId: uuid("message_id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  senderId: uuid("sender_id").references(() => users.userId, { onDelete: "set null" }),
  senderName: text("sender_name").notNull().default("System"),
  senderAvatar: text("sender_avatar"),
  type: messageTypeEnum("type").notNull().default("system"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  metadata: jsonb("metadata").$type<InboxMetadata>().default({}),
  isRead: boolean("is_read").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type InboxMessage = typeof inboxMessages.$inferSelect;
export type NewInboxMessage = typeof inboxMessages.$inferInsert;
