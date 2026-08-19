import { pgTable, uuid, text, timestamp, real, boolean, integer, jsonb } from "drizzle-orm/pg-core";

export const games = pgTable("games", {
  gameId: uuid("game_id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  shortDescription: text("short_description"),
  coverUrl: text("cover_url").notNull(),
  bannerUrl: text("banner_url"),
  genre: text("genre").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  rating: real("rating").notNull().default(4.5),
  ratingCount: integer("rating_count").notNull().default(0),
  price: real("price").notNull().default(0), // 0 means Free to Play
  originalPrice: real("original_price"),
  developer: text("developer").notNull().default("Indie Studio"),
  publisher: text("publisher").notNull().default("ForkPlay Studios"),
  releaseDate: timestamp("release_date").defaultNow(),
  downloadSize: text("download_size").default("12.4 GB"),
  isFeatured: boolean("is_featured").notNull().default(false),
  featuredOrder: integer("featured_order").default(0),
  isNewRelease: boolean("is_new_release").notNull().default(false),
  isPopular: boolean("is_popular").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
