import { DbClient } from "@/server/database/client";
import { users } from "@/server/database/schemas/user";
import { userGames } from "@/server/database/schemas/user-game";
import { games } from "@/server/database/schemas/game";
import { userAchievements } from "@/server/database/schemas/user-achievement";
import { achievements } from "@/server/database/schemas/achievement";
import { storeTransactions } from "@/server/database/schemas/store-transaction";
import { eq, and, desc, sql } from "drizzle-orm";

export class ProfileRepository {
  constructor(private db: DbClient) {}

  async getProfileData(userId: string) {
    // 1. Get user profile
    const [user] = await this.db
      .select({
        userId: users.userId,
        email: users.email,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        bannerUrl: users.bannerUrl,
        bio: users.bio,
        level: users.level,
        xp: users.xp,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (!user) return null;

    // 2. Get User Games
    const ownedGames = await this.db
      .select({
        gameId: games.gameId,
        slug: games.slug,
        title: games.title,
        coverUrl: games.coverUrl,
        bannerUrl: games.bannerUrl,
        genre: games.genre,
        rating: games.rating,
        playtimeMinutes: userGames.playtimeMinutes,
        lastPlayedAt: userGames.lastPlayedAt,
        isFavorite: userGames.isFavorite,
        status: userGames.status,
      })
      .from(userGames)
      .innerJoin(games, eq(games.gameId, userGames.gameId))
      .where(eq(userGames.userId, userId))
      .orderBy(desc(userGames.lastPlayedAt), desc(userGames.playtimeMinutes));

    // 3. Get User Achievements
    const userAchs = await this.db
      .select({
        achievementId: achievements.achievementId,
        title: achievements.title,
        description: achievements.description,
        iconUrl: achievements.iconUrl,
        rarity: achievements.rarity,
        points: achievements.points,
        gameTitle: games.title,
        gameSlug: games.slug,
        unlocked: userAchievements.unlocked,
        unlockedAt: userAchievements.unlockedAt,
      })
      .from(userAchievements)
      .innerJoin(
        achievements,
        eq(achievements.achievementId, userAchievements.achievementId),
      )
      .innerJoin(games, eq(games.gameId, achievements.gameId))
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.unlocked, true),
        ),
      )
      .orderBy(desc(userAchievements.unlockedAt));

    // 4. Get Store Purchases
    const purchases = await this.db
      .select({
        transactionId: storeTransactions.transactionId,
        amount: storeTransactions.amount,
        createdAt: storeTransactions.createdAt,
        gameTitle: games.title,
        gameSlug: games.slug,
      })
      .from(storeTransactions)
      .innerJoin(games, eq(games.gameId, storeTransactions.gameId))
      .where(eq(storeTransactions.userId, userId))
      .orderBy(desc(storeTransactions.createdAt));

    // 5. Build recent activity timeline
    const activityTimeline = [
      ...ownedGames
        .filter((g) => g.lastPlayedAt)
        .map((g) => ({
          type: "played" as const,
          title: `Logged session in ${g.title}`,
          subtitle: `${Math.round(g.playtimeMinutes / 60)} hrs total playtime`,
          timestamp: g.lastPlayedAt!,
          icon: "play",
        })),
      ...userAchs.map((a) => ({
        type: "achievement" as const,
        title: `Unlocked '${a.title}' (+${a.points} XP)`,
        subtitle: `${a.gameTitle} • ${a.rarity.toUpperCase()}`,
        timestamp: a.unlockedAt || new Date(),
        icon: "trophy",
      })),
      ...purchases.map((p) => ({
        type: "purchase" as const,
        title: `Acquired ${p.gameTitle}`,
        subtitle: `Digital License • $${p.amount.toFixed(2)}`,
        timestamp: p.createdAt,
        icon: "shopping-bag",
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 6. Aggregate stats
    const totalPlaytimeMinutes = ownedGames.reduce(
      (sum, g) => sum + g.playtimeMinutes,
      0,
    );
    const totalAchsCount = userAchs.length;

    const [totalAchsInSystem] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(achievements);

    const completionRate =
      (totalAchsInSystem?.count ?? 0) > 0
        ? Math.round((totalAchsCount / totalAchsInSystem.count) * 100)
        : 0;

    // Badges calculation
    const badges = [
      {
        id: "badge_alpha",
        name: "Alpha Pioneer",
        description: "Founding member of the ForkPlay platform",
        icon: "zap",
        tier: "legendary",
      },
      {
        id: "badge_hours",
        name: "Dedicated Voyager",
        description: "Logged over 50+ hours of tactical gaming",
        icon: "clock",
        tier: totalPlaytimeMinutes >= 3000 ? "epic" : "rare",
      },
      {
        id: "badge_collector",
        name: "Vault Curator",
        description: "Assembled 5+ titles in platform collection",
        icon: "layers",
        tier: ownedGames.length >= 5 ? "epic" : "common",
      },
      {
        id: "badge_hunter",
        name: "Trophy Specialist",
        description: "Unlocked multiple rare & legendary achievements",
        icon: "award",
        tier: totalAchsCount >= 3 ? "legendary" : "rare",
      },
    ];

    return {
      user,
      stats: {
        totalGames: ownedGames.length,
        totalPlaytimeMinutes,
        totalPlaytimeHours: (totalPlaytimeMinutes / 60).toFixed(1),
        achievementsCount: totalAchsCount,
        completionRate,
        xp: user.xp,
        level: user.level,
      },
      library: ownedGames,
      favoriteGames: ownedGames.filter((g) => g.isFavorite),
      recentActivity: activityTimeline.slice(0, 10),
      badges,
    };
  }
}
