import { pgTable, uuid, text, timestamp, integer, real } from "drizzle-orm/pg-core";
import { games } from "./game";

export const achievements = pgTable("achievements", {
  achievementId: uuid("achievement_id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.gameId, { onDelete: "cascade" }),
  key: text("key").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url").notNull(),
  rarity: text("rarity").notNull().default("common"), // common, rare, epic, legendary
  rarityPercentage: real("rarity_percentage").notNull().default(45.0),
  maxProgress: integer("max_progress").notNull().default(100),
  points: integer("points").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
