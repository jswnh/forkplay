import { pgTable, uuid, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { users } from "./user";
import { achievements } from "./achievement";

export const userAchievements = pgTable("user_achievements", {
  userAchievementId: uuid("user_achievement_id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  achievementId: uuid("achievement_id")
    .notNull()
    .references(() => achievements.achievementId, { onDelete: "cascade" }),
  unlocked: boolean("unlocked").notNull().default(false),
  progress: integer("progress").notNull().default(0),
  unlockedAt: timestamp("unlocked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
