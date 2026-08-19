import {
  pgTable,
  uuid,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./user";
import { storeItems } from "./store-item";

export const userItems = pgTable("user_items", {
  userItemId: uuid("user_item_id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  itemId: uuid("item_id")
    .notNull()
    .references(() => storeItems.itemId, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  isEquipped: boolean("is_equipped").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type UserItem = typeof userItems.$inferSelect;
export type NewUserItem = typeof userItems.$inferInsert;
