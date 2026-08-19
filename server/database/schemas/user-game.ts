import { pgTable, uuid, timestamp, boolean, integer, text } from "drizzle-orm/pg-core";
import { users } from "./user";
import { games } from "./game";

export const userGames = pgTable("user_games", {
  userGameId: uuid("user_game_id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.gameId, { onDelete: "cascade" }),
  isFavorite: boolean("is_favorite").notNull().default(false),
  isInstalled: boolean("is_installed").notNull().default(true),
  playtimeMinutes: integer("playtime_minutes").notNull().default(0),
  lastPlayedAt: timestamp("last_played_at"),
  status: text("status").notNull().default("in_library"), // in_library, playing, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type UserGame = typeof userGames.$inferSelect;
export type NewUserGame = typeof userGames.$inferInsert;
