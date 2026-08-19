import { DbClient } from "@/server/database/client";
import { achievements } from "@/server/database/schemas/achievement";
import { userAchievements } from "@/server/database/schemas/user-achievement";
import { games } from "@/server/database/schemas/game";
import { users } from "@/server/database/schemas/user";
import { inboxMessages } from "@/server/database/schemas/inbox-message";
import { eq, and, sql, desc, ilike, or } from "drizzle-orm";

export interface ListAchievementsFilter {
  gameId?: string;
  status?: "all" | "unlocked" | "in_progress" | "locked";
  search?: string;
  userId?: string | null;
}

export class AchievementsRepository {
  constructor(private db: DbClient) {}

  async listAchievements(filter: ListAchievementsFilter) {
    const { gameId, status = "all", search, userId } = filter;

    let query = this.db
      .select({
        achievementId: achievements.achievementId,
        gameId: achievements.gameId,
        gameTitle: games.title,
        gameSlug: games.slug,
        gameCoverUrl: games.coverUrl,
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
      .innerJoin(games, eq(games.gameId, achievements.gameId))
      .$dynamic();

    if (userId) {
      query = query.leftJoin(
        userAchievements,
        and(
          eq(userAchievements.achievementId, achievements.achievementId),
          eq(userAchievements.userId, userId),
        ),
      );
    }

    const conditions = [];

    if (gameId && gameId !== "all") {
      conditions.push(eq(achievements.gameId, gameId));
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(achievements.title, term),
          ilike(achievements.description, term),
          ilike(games.title, term),
        ),
      );
    }

    if (userId) {
      if (status === "unlocked") {
        conditions.push(eq(userAchievements.unlocked, true));
      } else if (status === "in_progress") {
        conditions.push(
          and(
            eq(userAchievements.unlocked, false),
            sql`${userAchievements.progress} > 0`,
          ),
        );
      } else if (status === "locked") {
        conditions.push(
          or(
            sql`${userAchievements.userAchievementId} IS NULL`,
            and(
              eq(userAchievements.unlocked, false),
              sql`coalesce(${userAchievements.progress}, 0) = 0`,
            ),
          ),
        );
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const allItems = await query.orderBy(
      desc(sql`coalesce(${userAchievements.unlocked}, false)`),
      desc(achievements.points),
    );

    // Calculate aggregated summary statistics
    const totalQuery = await this.db
      .select({
        totalAchievements: sql<number>`count(*)::int`,
        totalPoints: sql<number>`coalesce(sum(${achievements.points}), 0)::int`,
      })
      .from(achievements);

    let unlockedCount = 0;
    let earnedPoints = 0;
    let recentlyUnlocked: typeof allItems = [];

    if (userId) {
      const userUnlocked = await this.db
        .select({
          count: sql<number>`count(*)::int`,
          points: sql<number>`coalesce(sum(${achievements.points}), 0)::int`,
        })
        .from(userAchievements)
        .innerJoin(
          achievements,
          eq(achievements.achievementId, userAchievements.achievementId),
        )
        .where(
          and(
            eq(userAchievements.userId, userId),
            eq(userAchievements.unlocked, true),
          ),
        );

      unlockedCount = userUnlocked[0]?.count ?? 0;
      earnedPoints = userUnlocked[0]?.points ?? 0;

      recentlyUnlocked = allItems
        .filter((a) => a.unlocked && a.unlockedAt)
        .sort(
          (a, b) =>
            new Date(b.unlockedAt!).getTime() -
            new Date(a.unlockedAt!).getTime(),
        )
        .slice(0, 4);
    }

    const totalCount = totalQuery[0]?.totalAchievements ?? allItems.length;
    const totalPoints = totalQuery[0]?.totalPoints ?? 0;
    const completionPercentage =
      totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    return {
      achievements: allItems,
      stats: {
        totalAchievements: totalCount,
        unlockedCount,
        lockedCount: Math.max(0, totalCount - unlockedCount),
        completionPercentage,
        totalPoints,
        earnedPoints,
      },
      recentlyUnlocked,
    };
  }

  async unlockAchievement(userId: string, achievementId: string) {
    const [ach] = await this.db
      .select({
        achievementId: achievements.achievementId,
        gameId: achievements.gameId,
        title: achievements.title,
        description: achievements.description,
        points: achievements.points,
        maxProgress: achievements.maxProgress,
        gameTitle: games.title,
        gameSlug: games.slug,
      })
      .from(achievements)
      .innerJoin(games, eq(games.gameId, achievements.gameId))
      .where(eq(achievements.achievementId, achievementId))
      .limit(1);

    if (!ach) {
      throw new Error("Achievement not found");
    }

    const [existing] = await this.db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId),
        ),
      )
      .limit(1);

    if (existing) {
      await this.db
        .update(userAchievements)
        .set({
          unlocked: true,
          progress: ach.maxProgress,
          unlockedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userAchievements.userAchievementId, existing.userAchievementId));
    } else {
      await this.db.insert(userAchievements).values({
        userId,
        achievementId,
        unlocked: true,
        progress: ach.maxProgress,
        unlockedAt: new Date(),
      });
    }

    // Add XP to user
    await this.db
      .update(users)
      .set({
        xp: sql`${users.xp} + ${ach.points}`,
      })
      .where(eq(users.userId, userId));

    // Send inbox notification
    await this.db.insert(inboxMessages).values({
      userId,
      senderName: "Achievement Service",
      type: "achievement",
      title: `🏆 Unlocked: ${ach.title}`,
      body: `Magnificent achievement! You unlocked '${ach.title}' in ${ach.gameTitle}. +${ach.points} XP added to your gamer profile.`,
      metadata: {
        gameId: ach.gameId,
        gameSlug: ach.gameSlug,
        gameTitle: ach.gameTitle,
        actionUrl: "/achievements",
        actionLabel: "View Trophy Room",
        rewardPoints: ach.points,
      },
      isRead: false,
    });

    return {
      success: true,
      achievement: ach,
      message: `Achievement unlocked: ${ach.title}!`,
    };
  }
}
