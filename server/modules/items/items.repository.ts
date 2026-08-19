import { DbClient } from "@/server/database/client";
import { storeItems } from "@/server/database/schemas/store-item";
import { userItems } from "@/server/database/schemas/user-item";
import { games } from "@/server/database/schemas/game";
import { users } from "@/server/database/schemas/user";
import { storeTransactions } from "@/server/database/schemas/store-transaction";
import { inboxMessages } from "@/server/database/schemas/inbox-message";
import { eq, and, sql, desc, asc, ilike, or } from "drizzle-orm";
import { xenditClient } from "@/server/lib/xendit.client";

export interface ListItemsFilter {
  category?: string;
  gameId?: string;
  search?: string;
  rarity?: string;
  sortBy?: "featured" | "price_asc" | "price_desc" | "newest";
  userId?: string | null;
}

export class ItemsRepository {
  constructor(private db: DbClient) {}

  async listItems(filter: ListItemsFilter) {
    const { category, gameId, search, rarity, sortBy = "featured", userId } = filter;

    let query = this.db
      .select({
        itemId: storeItems.itemId,
        name: storeItems.name,
        slug: storeItems.slug,
        description: storeItems.description,
        shortDescription: storeItems.shortDescription,
        category: storeItems.category,
        gameId: storeItems.gameId,
        gameTitle: games.title,
        price: storeItems.price,
        originalPrice: storeItems.originalPrice,
        imageUrl: storeItems.imageUrl,
        rarity: storeItems.rarity,
        isFeatured: storeItems.isFeatured,
        isActive: storeItems.isActive,
        createdAt: storeItems.createdAt,
        inInventory: userId
          ? sql<boolean>`${userItems.userItemId} IS NOT NULL`
          : sql<boolean>`false`,
        ownedQuantity: userId
          ? sql<number>`coalesce(${userItems.quantity}, 0)`
          : sql<number>`0`,
      })
      .from(storeItems)
      .leftJoin(games, eq(storeItems.gameId, games.gameId))
      .$dynamic();

    if (userId) {
      query = query.leftJoin(
        userItems,
        and(eq(userItems.itemId, storeItems.itemId), eq(userItems.userId, userId)),
      );
    }

    const conditions = [eq(storeItems.isActive, true)];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(storeItems.name, term),
          ilike(storeItems.description, term),
          ilike(storeItems.category, term),
        ) as any,
      );
    }

    if (category && category !== "all" && category.trim()) {
      conditions.push(eq(storeItems.category, category));
    }

    if (gameId && gameId.trim()) {
      conditions.push(eq(storeItems.gameId, gameId));
    }

    if (rarity && rarity !== "all" && rarity.trim()) {
      conditions.push(eq(storeItems.rarity, rarity));
    }

    query = query.where(and(...conditions));

    if (sortBy === "price_asc") {
      query = query.orderBy(asc(storeItems.price));
    } else if (sortBy === "price_desc") {
      query = query.orderBy(desc(storeItems.price));
    } else if (sortBy === "newest") {
      query = query.orderBy(desc(storeItems.createdAt));
    } else {
      query = query.orderBy(desc(storeItems.isFeatured), desc(storeItems.price));
    }

    return await query;
  }

  async getItemByIdOrSlug(idOrSlug: string, userId?: string | null) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    let query = this.db
      .select({
        itemId: storeItems.itemId,
        name: storeItems.name,
        slug: storeItems.slug,
        description: storeItems.description,
        shortDescription: storeItems.shortDescription,
        category: storeItems.category,
        gameId: storeItems.gameId,
        gameTitle: games.title,
        price: storeItems.price,
        originalPrice: storeItems.originalPrice,
        imageUrl: storeItems.imageUrl,
        rarity: storeItems.rarity,
        isFeatured: storeItems.isFeatured,
        isActive: storeItems.isActive,
        metadata: storeItems.metadata,
        createdAt: storeItems.createdAt,
        inInventory: userId
          ? sql<boolean>`${userItems.userItemId} IS NOT NULL`
          : sql<boolean>`false`,
        ownedQuantity: userId
          ? sql<number>`coalesce(${userItems.quantity}, 0)`
          : sql<number>`0`,
      })
      .from(storeItems)
      .leftJoin(games, eq(storeItems.gameId, games.gameId))
      .$dynamic();

    if (userId) {
      query = query.leftJoin(
        userItems,
        and(eq(userItems.itemId, storeItems.itemId), eq(userItems.userId, userId)),
      );
    }

    const [item] = await query
      .where(isUuid ? eq(storeItems.itemId, idOrSlug) : eq(storeItems.slug, idOrSlug))
      .limit(1);

    return item ?? null;
  }

  async createItemCheckout(userId: string, itemId: string, originUrl?: string) {
    const [item] = await this.db
      .select()
      .from(storeItems)
      .where(eq(storeItems.itemId, itemId))
      .limit(1);

    if (!item) throw new Error("Store item not found");

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (!user) throw new Error("User not found");

    // Free item claim
    if (item.price === 0) {
      return await this.grantItemToUser(userId, item.itemId, "Free Claim");
    }

    const externalId = `FP-ITEM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const baseUrl = originUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const invoice = await xenditClient.createInvoice({
      externalId,
      amount: item.price,
      payerEmail: user.email,
      customerName: user.displayName || user.username || "Operator",
      gameTitle: item.name,
      description: `ForkPlay Item Order: ${item.name}`,
      successRedirectUrl: `${baseUrl}/store?checkout=success&tx=${externalId}&itemId=${item.itemId}`,
      failureRedirectUrl: `${baseUrl}/store?checkout=failed&itemId=${item.itemId}`,
    });

    const [transaction] = await this.db
      .insert(storeTransactions)
      .values({
        userId,
        itemId: item.itemId,
        itemType: "item",
        amount: item.price,
        paymentMethod: "Online Payment",
        status: "pending",
        externalId,
        xenditInvoiceId: invoice.id,
        xenditPaymentUrl: invoice.invoice_url,
        xenditStatus: invoice.status,
      })
      .returning();

    return {
      isPending: true,
      transactionId: transaction.transactionId,
      externalId,
      invoiceUrl: invoice.invoice_url,
      item,
    };
  }

  async verifyItemPayment(userId: string, externalId: string) {
    const [tx] = await this.db
      .select()
      .from(storeTransactions)
      .where(
        and(
          eq(storeTransactions.userId, userId),
          eq(storeTransactions.externalId, externalId),
        ),
      )
      .limit(1);

    if (!tx) throw new Error("Transaction record not found");

    if (tx.status === "completed") {
      const [item] = await this.db
        .select()
        .from(storeItems)
        .where(eq(storeItems.itemId, tx.itemId!))
        .limit(1);
      return { success: true, alreadyCompleted: true, item };
    }

    if (!tx.xenditInvoiceId) {
      throw new Error("Missing gateway reference");
    }

    const invoice = await xenditClient.getInvoice(tx.xenditInvoiceId);

    if (invoice.status === "PAID" || invoice.status === "SETTLED") {
      const [updatedTx] = await this.db
        .update(storeTransactions)
        .set({
          status: "completed",
          xenditStatus: invoice.status,
          updatedAt: new Date(),
        })
        .where(eq(storeTransactions.transactionId, tx.transactionId))
        .returning();

      // Add item to user inventory
      if (tx.itemId) {
        const [existing] = await this.db
          .select()
          .from(userItems)
          .where(
            and(eq(userItems.userId, userId), eq(userItems.itemId, tx.itemId)),
          )
          .limit(1);

        if (existing) {
          await this.db
            .update(userItems)
            .set({
              quantity: existing.quantity + 1,
              updatedAt: new Date(),
            })
            .where(eq(userItems.userItemId, existing.userItemId));
        } else {
          await this.db.insert(userItems).values({
            userId,
            itemId: tx.itemId,
            quantity: 1,
            isEquipped: false,
          });
        }
      }

      const [item] = await this.db
        .select()
        .from(storeItems)
        .where(eq(storeItems.itemId, tx.itemId!))
        .limit(1);

      const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₱";
      await this.db.insert(inboxMessages).values({
        userId,
        senderName: "ForkPlay Item Vault",
        senderAvatar:
          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=150&auto=format&fit=crop",
        type: "store",
        title: `🎒 Item Acquired: ${item?.name || "Store Item"}`,
        body: `Your payment of ${currencySymbol}${Number(tx.amount).toFixed(2)} is confirmed. ${item?.name || "Item"} has been transferred to your operator inventory.`,
        metadata: {
          itemId: tx.itemId,
          itemName: item?.name,
          orderId: tx.externalId,
          amount: tx.amount,
        },
        isRead: false,
      });

      return { success: true, isPaid: true, item, transaction: updatedTx };
    }

    return { success: false, isPaid: false, message: "Payment awaiting clearance" };
  }

  async grantItemToUser(userId: string, itemId: string, paymentMethod = "Platform Credits") {
    const [item] = await this.db
      .select()
      .from(storeItems)
      .where(eq(storeItems.itemId, itemId))
      .limit(1);

    if (!item) throw new Error("Store item not found");

    const [existing] = await this.db
      .select()
      .from(userItems)
      .where(and(eq(userItems.userId, userId), eq(userItems.itemId, itemId)))
      .limit(1);

    if (existing) {
      await this.db
        .update(userItems)
        .set({
          quantity: existing.quantity + 1,
          updatedAt: new Date(),
        })
        .where(eq(userItems.userItemId, existing.userItemId));
    } else {
      await this.db.insert(userItems).values({
        userId,
        itemId,
        quantity: 1,
        isEquipped: false,
      });
    }

    const [tx] = await this.db
      .insert(storeTransactions)
      .values({
        userId,
        itemId,
        itemType: "item",
        amount: item.price,
        paymentMethod,
        status: "completed",
        externalId: `FP-ITEM-${Date.now()}`,
      })
      .returning();

    const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₱";
    await this.db.insert(inboxMessages).values({
      userId,
      senderName: "ForkPlay Item Vault",
      type: "store",
      title: `🎒 Item Unlocked: ${item.name}`,
      body: `You acquired ${item.name} (${currencySymbol}${item.price.toFixed(2)}). It is now in your operator inventory.`,
      metadata: {
        itemId,
        itemName: item.name,
      },
      isRead: false,
    });

    return { success: true, item, transaction: tx };
  }
}
