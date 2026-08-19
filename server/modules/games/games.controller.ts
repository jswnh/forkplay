import { AppContext } from "@/server/context";
import { GamesRepository, ListGamesFilter } from "./games.repository";
import { db } from "@/server/database/client";
import { AuthController } from "@/lib/auth";
import { AppError } from "@/server/lib/app-error";

const gamesRepo = new GamesRepository(db);

export class GamesController {
  async list(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    const query = ctx.req.query();

    const filter: ListGamesFilter = {
      search: query.search,
      genre: query.genre,
      tab: (query.tab as ListGamesFilter["tab"]) || "all",
      sortBy: (query.sortBy as ListGamesFilter["sortBy"]) || "popular",
      userId: user?.userId ?? null,
    };

    const gamesList = await gamesRepo.listGames(filter);
    return ctx.json({ games: gamesList });
  }

  async getFeatured(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    const featured = await gamesRepo.getFeaturedGame(user?.userId ?? null);
    return ctx.json({ game: featured });
  }

  async getByIdOrSlug(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    const idOrSlug = ctx.req.param("idOrSlug");
    if (!idOrSlug) {
      throw new AppError("Game ID or slug is required", 400);
    }

    const game = await gamesRepo.getGameByIdOrSlug(
      idOrSlug,
      user?.userId ?? null,
    );

    if (!game) {
      throw new AppError("Game not found", 404);
    }

    return ctx.json({ game });
  }

  async toggleFavorite(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const gameId = ctx.req.param("id");
    if (!gameId) {
      throw new AppError("Game ID is required", 400);
    }

    const result = await gamesRepo.toggleFavorite(user.userId, gameId);
    return ctx.json({ success: true, ...result });
  }

  async recordPlaySession(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const gameId = ctx.req.param("id");
    if (!gameId) {
      throw new AppError("Game ID is required", 400);
    }

    const body = await ctx.req.json().catch(() => ({}));
    const minutes = Number(body.minutes) || 30;

    const result = await gamesRepo.recordPlaySession(
      user.userId,
      gameId,
      minutes,
    );

    return ctx.json({ success: true, ...result });
  }

  async addToLibrary(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const gameId = ctx.req.param("id");
    if (!gameId) {
      throw new AppError("Game ID is required", 400);
    }

    const result = await gamesRepo.addToLibrary(user.userId, gameId);
    return ctx.json({ success: true, userGame: result });
  }
}
