import { DbClient } from "@/server/database/client";
import { games } from "@/server/database/schemas/game";
import { userGames } from "@/server/database/schemas/user-game";
import { achievements } from "@/server/database/schemas/achievement";
import { userAchievements } from "@/server/database/schemas/user-achievement";
import { inboxMessages } from "@/server/database/schemas/inbox-message";
import { users } from "@/server/database/schemas/user";
import { eq, and, sql, desc, asc, ilike, or } from "drizzle-orm";

export interface ListGamesFilter {
  search?: string;
  genre?: string;
  tab?: "all" | "recent" | "favorites" | "new" | "popular" | "library";
  sortBy?: "rating" | "playtime" | "recent" | "title" | "popular";
  userId?: string | null;
}

export class GamesRepository {
  constructor(private db: DbClient) {}

  async listGames(filter: ListGamesFilter) {
    const { search, genre, tab = "all", sortBy = "popular", userId } = filter;

    // Base query selecting games and optionally joining user_games if userId exists
    let query = this.db
      .select({
        gameId: games.gameId,
        slug: games.slug,
        title: games.title,
        description: games.description,
        shortDescription: games.shortDescription,
        coverUrl: games.coverUrl,
        bannerUrl: games.bannerUrl,
        genre: games.genre,
        tags: games.tags,
        rating: games.rating,
        ratingCount: games.ratingCount,
        price: games.price,
        originalPrice: games.originalPrice,
        developer: games.developer,
        publisher: games.publisher,
        releaseDate: games.releaseDate,
        downloadSize: games.downloadSize,
        isFeatured: games.isFeatured,
        isNewRelease: games.isNewRelease,
        isPopular: games.isPopular,
        // User specific fields
        isFavorite: userId
          ? sql<boolean>`coalesce(${userGames.isFavorite}, false)`
          : sql<boolean>`false`,
        inLibrary: userId
          ? sql<boolean>`${userGames.userGameId} IS NOT NULL AND coalesce(${userGames.status}, '') != 'wishlist'`
          : sql<boolean>`false`,
        playtimeMinutes: userId
          ? sql<number>`coalesce(${userGames.playtimeMinutes}, 0)`
          : sql<number>`0`,
        lastPlayedAt: userId ? userGames.lastPlayedAt : sql<Date | null>`null`,
        libraryStatus: userId ? userGames.status : sql<string | null>`null`,
      })
      .from(games)
      .$dynamic();

    if (userId) {
      query = query.leftJoin(
        userGames,
        and(eq(userGames.gameId, games.gameId), eq(userGames.userId, userId)),
      );
    }

    const conditions = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(games.title, term),
          ilike(games.genre, term),
          ilike(games.shortDescription, term),
          ilike(games.developer, term),
        ),
      );
    }

    if (genre && genre !== "All" && genre.trim()) {
      conditions.push(eq(games.genre, genre));
    }

    if (userId) {
      if (tab === "favorites") {
        conditions.push(eq(userGames.isFavorite, true));
      } else if (tab === "recent") {
        conditions.push(sql`${userGames.lastPlayedAt} IS NOT NULL`);
      } else if (tab === "library") {
        conditions.push(
          sql`${userGames.userGameId} IS NOT NULL AND coalesce(${userGames.status}, '') != 'wishlist'`,
        );
      }
    }

    if (tab === "new") {
      conditions.push(eq(games.isNewRelease, true));
    } else if (tab === "popular") {
      conditions.push(eq(games.isPopular, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (tab === "recent" && userId) {
      query = query.orderBy(desc(userGames.lastPlayedAt));
    } else if (sortBy === "playtime" && userId) {
      query = query.orderBy(desc(userGames.playtimeMinutes));
    } else if (sortBy === "rating") {
      query = query.orderBy(desc(games.rating));
    } else if (sortBy === "title") {
      query = query.orderBy(asc(games.title));
    } else {
      query = query.orderBy(desc(games.isFeatured), desc(games.rating));
    }

    return await query;
  }

  async getFeaturedGame(userId?: string | null) {
    let query = this.db
      .select({
        gameId: games.gameId,
        slug: games.slug,
        title: games.title,
        description: games.description,
        shortDescription: games.shortDescription,
        coverUrl: games.coverUrl,
        bannerUrl: games.bannerUrl,
        genre: games.genre,
        tags: games.tags,
        rating: games.rating,
        ratingCount: games.ratingCount,
        price: games.price,
        originalPrice: games.originalPrice,
        developer: games.developer,
        publisher: games.publisher,
        releaseDate: games.releaseDate,
        downloadSize: games.downloadSize,
        isFeatured: games.isFeatured,
        isFavorite: userId
          ? sql<boolean>`coalesce(${userGames.isFavorite}, false)`
          : sql<boolean>`false`,
        inLibrary: userId
          ? sql<boolean>`${userGames.userGameId} IS NOT NULL AND coalesce(${userGames.status}, '') != 'wishlist'`
          : sql<boolean>`false`,
        playtimeMinutes: userId
          ? sql<number>`coalesce(${userGames.playtimeMinutes}, 0)`
          : sql<number>`0`,
        lastPlayedAt: userId ? userGames.lastPlayedAt : sql<Date | null>`null`,
      })
      .from(games)
      .$dynamic();

    if (userId) {
      query = query.leftJoin(
        userGames,
        and(eq(userGames.gameId, games.gameId), eq(userGames.userId, userId)),
      );
    }

    const featured = await query
      .where(eq(games.isFeatured, true))
      .orderBy(asc(games.featuredOrder))
      .limit(1);

    if (featured.length > 0) return featured[0];

    // Fallback to highest rated
    const highestRated = await query.orderBy(desc(games.rating)).limit(1);
    return highestRated[0] ?? null;
  }

  async getGameByIdOrSlug(idOrSlug: string, userId?: string | null) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    let query = this.db
      .select({
        gameId: games.gameId,
        slug: games.slug,
        title: games.title,
        description: games.description,
        shortDescription: games.shortDescription,
        coverUrl: games.coverUrl,
        bannerUrl: games.bannerUrl,
        genre: games.genre,
        tags: games.tags,
        rating: games.rating,
        ratingCount: games.ratingCount,
        price: games.price,
        originalPrice: games.originalPrice,
        developer: games.developer,
        publisher: games.publisher,
        releaseDate: games.releaseDate,
        downloadSize: games.downloadSize,
        isFeatured: games.isFeatured,
        isNewRelease: games.isNewRelease,
        isPopular: games.isPopular,
        isFavorite: userId
          ? sql<boolean>`coalesce(${userGames.isFavorite}, false)`
          : sql<boolean>`false`,
        inLibrary: userId
          ? sql<boolean>`${userGames.userGameId} IS NOT NULL AND coalesce(${userGames.status}, '') != 'wishlist'`
          : sql<boolean>`false`,
        playtimeMinutes: userId
          ? sql<number>`coalesce(${userGames.playtimeMinutes}, 0)`
          : sql<number>`0`,
        lastPlayedAt: userId ? userGames.lastPlayedAt : sql<Date | null>`null`,
        libraryStatus: userId ? userGames.status : sql<string | null>`null`,
      })
      .from(games)
      .$dynamic();

    if (userId) {
      query = query.leftJoin(
        userGames,
        and(eq(userGames.gameId, games.gameId), eq(userGames.userId, userId)),
      );
    }

    const result = await query
      .where(isUuid ? eq(games.gameId, idOrSlug) : eq(games.slug, idOrSlug))
      .limit(1);

    if (!result[0]) return null;

    const game = result[0];

    // Fetch achievements for this game with user unlock status
    let achievementsQuery = this.db
      .select({
        achievementId: achievements.achievementId,
        key: achievements.key,
        title: achievements.title,
        description: achievements.description,
        iconUrl: achievements.iconUrl,
        rarity: achievements.rarity,
        rarityPercentage: achievements.rarityPercentage,
        maxProgress: achievements.maxProgress,
        points: achievements.points,
        unlocked: userId
          ? sql<boolean>`coalesce(${userAchievements.unlocked}, false)`
          : sql<boolean>`false`,
        progress: userId
          ? sql<number>`coalesce(${userAchievements.progress}, 0)`
          : sql<number>`0`,
        unlockedAt: userId ? userAchievements.unlockedAt : sql<Date | null>`null`,
      })
      .from(achievements)
      .$dynamic();

    if (userId) {
      achievementsQuery = achievementsQuery.leftJoin(
        userAchievements,
        and(
          eq(userAchievements.achievementId, achievements.achievementId),
          eq(userAchievements.userId, userId),
        ),
      );
    }

    const gameAchievements = await achievementsQuery
      .where(eq(achievements.gameId, game.gameId))
      .orderBy(desc(achievements.points));

    return {
      ...game,
      achievements: gameAchievements,
    };
  }

  async toggleFavorite(userId: string, gameId: string) {
    const existing = await this.db
      .select()
      .from(userGames)
      .where(and(eq(userGames.userId, userId), eq(userGames.gameId, gameId)))
      .limit(1);

    if (existing[0]) {
      const newStatus = !existing[0].isFavorite;
      await this.db
        .update(userGames)
        .set({ isFavorite: newStatus, updatedAt: new Date() })
        .where(eq(userGames.userGameId, existing[0].userGameId));
      return { isFavorite: newStatus };
    } else {
      await this.db.insert(userGames).values({
        userId,
        gameId,
        isFavorite: true,
        status: "wishlist",
      });
      return { isFavorite: true };
    }
  }

  async addToLibrary(userId: string, gameId: string) {
    const existing = await this.db
      .select()
      .from(userGames)
      .where(and(eq(userGames.userId, userId), eq(userGames.gameId, gameId)))
      .limit(1);

    if (existing[0]) {
      if (existing[0].status === "wishlist") {
        const [updated] = await this.db
          .update(userGames)
          .set({ status: "in_library", updatedAt: new Date() })
          .where(eq(userGames.userGameId, existing[0].userGameId))
          .returning();
        return updated;
      }
      return existing[0];
    }

    const [inserted] = await this.db
      .insert(userGames)
      .values({
        userId,
        gameId,
        isFavorite: false,
        status: "in_library",
        playtimeMinutes: 0,
      })
      .returning();

    return inserted;
  }

  async recordPlaySession(userId: string, gameId: string, minutes: number = 30) {
    // 1. Fetch game info
    const [game] = await this.db
      .select()
      .from(games)
      .where(eq(games.gameId, gameId))
      .limit(1);

    if (!game) {
      throw new Error("Game not found");
    }

    // 2. Ensure userGame exists and user owns the game
    const existing = await this.db
      .select()
      .from(userGames)
      .where(and(eq(userGames.userId, userId), eq(userGames.gameId, gameId)))
      .limit(1);

    const isOwned = existing[0] && existing[0].status !== "wishlist";

    if (!isOwned && game.price > 0) {
      throw new Error("You must acquire this game from the Store before launching.");
    }

    let updatedPlaytime = minutes;
    if (existing[0]) {
      updatedPlaytime = existing[0].playtimeMinutes + minutes;
      await this.db
        .update(userGames)
        .set({
          playtimeMinutes: updatedPlaytime,
          lastPlayedAt: new Date(),
          status: isOwned ? existing[0].status : "in_library",
          updatedAt: new Date(),
        })
        .where(eq(userGames.userGameId, existing[0].userGameId));
    } else {
      await this.db.insert(userGames).values({
        userId,
        gameId,
        playtimeMinutes: minutes,
        lastPlayedAt: new Date(),
        status: "in_library",
      });
    }

    // 3. Check for achievements to unlock based on play session
    const gameAchievements = await this.db
      .select()
      .from(achievements)
      .where(eq(achievements.gameId, gameId));

    const newlyUnlocked: Array<{ title: string; points: number }> = [];

    for (const ach of gameAchievements) {
      const [userAch] = await this.db
        .select()
        .from(userAchievements)
        .where(
          and(
            eq(userAchievements.userId, userId),
            eq(userAchievements.achievementId, ach.achievementId),
          ),
        )
        .limit(1);

      if (!userAch) {
        // Unlock first common achievement if not unlocked
        if (ach.rarity === "common") {
          await this.db.insert(userAchievements).values({
            userId,
            achievementId: ach.achievementId,
            unlocked: true,
            progress: ach.maxProgress,
            unlockedAt: new Date(),
          });
          newlyUnlocked.push({ title: ach.title, points: ach.points });

          // Create notification in inbox
          await this.db.insert(inboxMessages).values({
            userId,
            senderName: "Achievement Engine",
            type: "achievement",
            title: `🏆 Achievement Unlocked: ${ach.title}`,
            body: `Outstanding! You unlocked '${ach.title}' while playing ${game?.title || "your game"}. +${ach.points} XP added!`,
            metadata: {
              gameId,
              gameSlug: game?.slug,
              gameTitle: game?.title,
              actionUrl: "/achievements",
              actionLabel: "View Achievements",
              rewardPoints: ach.points,
            },
            isRead: false,
          });

          // Add XP to user
          await this.db
            .update(users)
            .set({
              xp: sql`${users.xp} + ${ach.points}`,
            })
            .where(eq(users.userId, userId));
        } else {
          // Add partial progress
          await this.db.insert(userAchievements).values({
            userId,
            achievementId: ach.achievementId,
            unlocked: false,
            progress: Math.min(ach.maxProgress, Math.floor(ach.maxProgress * 0.35)),
          });
        }
      }
    }

    return {
      playtimeMinutes: updatedPlaytime,
      lastPlayedAt: new Date(),
      newlyUnlocked,
    };
  }
}
