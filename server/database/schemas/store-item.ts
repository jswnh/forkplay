import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  doublePrecision,
  jsonb,
} from "drizzle-orm/pg-core";
import { games } from "./game";

export const storeItems = pgTable("store_items", {
  itemId: uuid("item_id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  category: text("category").notNull().default("dlc"), // dlc, cosmetic, currency, pass, consumable
  gameId: uuid("game_id").references(() => games.gameId, {
    onDelete: "set null",
  }),
  price: doublePrecision("price").notNull().default(0),
  originalPrice: doublePrecision("original_price"),
  imageUrl: text("image_url").notNull(),
  rarity: text("rarity").notNull().default("common"), // common, rare, epic, legendary
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type StoreItem = typeof storeItems.$inferSelect;
export type NewStoreItem = typeof storeItems.$inferInsert;
