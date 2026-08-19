import { AppContext } from "@/server/context";
import { StoreRepository, ListStoreFilter } from "./store.repository";
import { db } from "@/server/database/client";
import { AuthController } from "@/lib/auth";
import { AppError } from "@/server/lib/app-error";

const storeRepo = new StoreRepository(db);

export class StoreController {
  async list(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    const query = ctx.req.query();

    const filter: ListStoreFilter = {
      search: query.search,
      genre: query.genre,
      priceFilter: query.priceFilter as ListStoreFilter["priceFilter"],
      sortBy: query.sortBy as ListStoreFilter["sortBy"],
      userId: user?.userId ?? null,
    };

    const games = await storeRepo.listStoreGames(filter);
    return ctx.json({ games });
  }

  async checkoutXendit(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const body = await ctx.req.json();
    const { gameId } = body;

    if (!gameId) {
      throw new AppError("Game ID is required", 400);
    }

    const origin = ctx.req.header("origin") || ctx.req.header("referer");

    try {
      const result = await storeRepo.createXenditCheckout(
        user.userId,
        gameId,
        origin,
      );
      return ctx.json({ success: true, ...result });
    } catch (err: any) {
      throw new AppError(err.message || "Failed to initialize Xendit checkout", 400);
    }
  }

  async verifyXendit(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const body = await ctx.req.json();
    const { externalId } = body;

    if (!externalId) {
      throw new AppError("Transaction external ID is required", 400);
    }

    try {
      const result = await storeRepo.verifyXenditPayment(user.userId, externalId);
      return ctx.json(result);
    } catch (err: any) {
      throw new AppError(err.message || "Verification failed", 400);
    }
  }

  async purchase(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const body = await ctx.req.json();
    const { gameId, paymentMethod = "Platform Credits" } = body;

    if (!gameId) {
      throw new AppError("Game ID is required", 400);
    }

    try {
      const result = await storeRepo.purchaseGame(
        user.userId,
        gameId,
        paymentMethod,
      );
      return ctx.json({ success: true, ...result });
    } catch (err: any) {
      throw new AppError(err.message || "Purchase failed", 400);
    }
  }
}
