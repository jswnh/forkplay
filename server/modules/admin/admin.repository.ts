import { DbClient } from "@/server/database/client";
import { users } from "@/server/database/schemas/user";
import { games, NewGame } from "@/server/database/schemas/game";
import { storeItems, NewStoreItem } from "@/server/database/schemas/store-item";
import { achievements, NewAchievement } from "@/server/database/schemas/achievement";
import { storeTransactions } from "@/server/database/schemas/store-transaction";
import { inboxMessages } from "@/server/database/schemas/inbox-message";
import { sql, desc, eq } from "drizzle-orm";

export class AdminRepository {
  constructor(private db: DbClient) {}

  async getPlatformStats() {
    const [usersCount] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    const [gamesCount] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(games);

    const [itemsCount] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(storeItems);

    const [achievementsCount] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(achievements);

    const [transactionsData] = await this.db
      .select({
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${storeTransactions.amount}), 0)::numeric`,
      })
      .from(storeTransactions);

    const [messagesCount] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(inboxMessages);

    return {
      totalUsers: usersCount?.count ?? 0,
      totalGames: gamesCount?.count ?? 0,
      totalItems: itemsCount?.count ?? 0,
      totalAchievements: achievementsCount?.count ?? 0,
      totalOrders: transactionsData?.count ?? 0,
      totalRevenue: Number(transactionsData?.revenue ?? 0),
      totalMessages: messagesCount?.count ?? 0,
    };
  }

  async listRecentTransactions(limit = 15) {
    return await this.db
      .select({
        transactionId: storeTransactions.transactionId,
        amount: storeTransactions.amount,
        paymentMethod: storeTransactions.paymentMethod,
        status: storeTransactions.status,
        createdAt: storeTransactions.createdAt,
        userEmail: users.email,
        username: users.username,
        gameTitle: games.title,
        itemName: storeItems.name,
      })
      .from(storeTransactions)
      .leftJoin(users, eq(storeTransactions.userId, users.userId))
      .leftJoin(games, eq(storeTransactions.gameId, games.gameId))
      .leftJoin(storeItems, eq(storeTransactions.itemId, storeItems.itemId))
      .orderBy(desc(storeTransactions.createdAt))
      .limit(limit);
  }

  async createGame(data: NewGame) {
    const [newGame] = await this.db.insert(games).values(data).returning();
    return newGame;
  }

  async updateGame(gameId: string, data: Partial<NewGame>) {
    const [updated] = await this.db
      .update(games)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(games.gameId, gameId))
      .returning();
    return updated ?? null;
  }

  async deleteGame(gameId: string) {
    const [deleted] = await this.db
      .delete(games)
      .where(eq(games.gameId, gameId))
      .returning();
    return deleted ?? null;
  }

  async listItems() {
    return await this.db
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
      })
      .from(storeItems)
      .leftJoin(games, eq(storeItems.gameId, games.gameId))
      .orderBy(desc(storeItems.createdAt));
  }

  async createItem(data: NewStoreItem) {
    const [newItem] = await this.db.insert(storeItems).values(data).returning();
    return newItem;
  }

  async updateItem(itemId: string, data: Partial<NewStoreItem>) {
    const [updated] = await this.db
      .update(storeItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(storeItems.itemId, itemId))
      .returning();
    return updated ?? null;
  }

  async deleteItem(itemId: string) {
    const [deleted] = await this.db
      .delete(storeItems)
      .where(eq(storeItems.itemId, itemId))
      .returning();
    return deleted ?? null;
  }

  async createAchievement(data: NewAchievement) {
    const [newAch] = await this.db.insert(achievements).values(data).returning();
    return newAch;
  }

  async updateAchievement(achievementId: string, data: Partial<NewAchievement>) {
    const [updated] = await this.db
      .update(achievements)
      .set(data)
      .where(eq(achievements.achievementId, achievementId))
      .returning();
    return updated ?? null;
  }

  async deleteAchievement(achievementId: string) {
    const [deleted] = await this.db
      .delete(achievements)
      .where(eq(achievements.achievementId, achievementId))
      .returning();
    return deleted ?? null;
  }

  async broadcastAnnouncement({
    title,
    body,
    actionUrl,
    actionLabel,
  }: {
    title: string;
    body: string;
    actionUrl?: string;
    actionLabel?: string;
  }) {
    const allUsers = await this.db.select({ userId: users.userId }).from(users);

    const messagesToInsert = allUsers.map((u) => ({
      userId: u.userId,
      senderId: null,
      senderName: "ForkPlay High Command",
      senderAvatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop",
      type: "announcement" as const,
      title,
      body,
      metadata: {
        broadcast: true,
        actionUrl: actionUrl || "/games",
        actionLabel: actionLabel || "Acknowledge Order",
      },
      isRead: false,
    }));

    if (messagesToInsert.length > 0) {
      await this.db.insert(inboxMessages).values(messagesToInsert);
    }

    return { recipientCount: messagesToInsert.length };
  }
}
