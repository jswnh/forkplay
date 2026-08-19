import { AppContext } from "@/server/context";
import {
  AchievementsRepository,
  ListAchievementsFilter,
} from "./achievements.repository";
import { db } from "@/server/database/client";
import { AuthController } from "@/lib/auth";
import { AppError } from "@/server/lib/app-error";

const achievementsRepo = new AchievementsRepository(db);

export class AchievementsController {
  async list(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    const query = ctx.req.query();

    const filter: ListAchievementsFilter = {
      gameId: query.gameId,
      status: query.status as ListAchievementsFilter["status"],
      search: query.search,
      userId: user?.userId ?? null,
    };

    const data = await achievementsRepo.listAchievements(filter);
    return ctx.json(data);
  }

  async unlock(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const achievementId = ctx.req.param("id");
    if (!achievementId) {
      throw new AppError("Achievement ID is required", 400);
    }

    try {
      const result = await achievementsRepo.unlockAchievement(
        user.userId,
        achievementId,
      );
      return ctx.json(result);
    } catch (err: any) {
      throw new AppError(err.message || "Failed to unlock achievement", 400);
    }
  }
}
