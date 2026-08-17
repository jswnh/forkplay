import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const games = pgTable("games", {
  gameId: uuid("game_id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
