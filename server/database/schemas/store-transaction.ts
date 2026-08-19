import { pgTable, uuid, text, timestamp, real } from "drizzle-orm/pg-core";
import { users } from "./user";
import { games } from "./game";

export const storeTransactions = pgTable("store_transactions", {
  transactionId: uuid("transaction_id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  gameId: uuid("game_id").references(() => games.gameId, { onDelete: "set null" }),
  itemId: uuid("item_id"),
  itemType: text("item_type").notNull().default("game"), // game, item
  amount: real("amount").notNull().default(0),
  paymentMethod: text("payment_method").notNull().default("Online Payment"),
  status: text("status").notNull().default("completed"), // completed, pending, failed, refunded
  externalId: text("external_id"),
  xenditInvoiceId: text("xendit_invoice_id"),
  xenditPaymentUrl: text("xendit_payment_url"),
  xenditStatus: text("xendit_status"), // PENDING, PAID, SETTLED, EXPIRED
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type StoreTransaction = typeof storeTransactions.$inferSelect;
export type NewStoreTransaction = typeof storeTransactions.$inferInsert;
