import { AppContext } from "@/server/context";
import { ItemsRepository, ListItemsFilter } from "./items.repository";
import { db } from "@/server/database/client";
import { AuthController } from "@/lib/auth";
import { AppError } from "@/server/lib/app-error";

const itemsRepo = new ItemsRepository(db);

export class ItemsController {
  async list(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    const query = ctx.req.query();

    const filter: ListItemsFilter = {
      category: query.category,
      gameId: query.gameId,
      search: query.search,
      rarity: query.rarity,
      sortBy: (query.sortBy as ListItemsFilter["sortBy"]) || "featured",
      userId: user?.userId ?? null,
    };

    const items = await itemsRepo.listItems(filter);
    return ctx.json({ items });
  }

  async getByIdOrSlug(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    const idOrSlug = ctx.req.param("idOrSlug");
    if (!idOrSlug) throw new AppError("Item identifier is required", 400);

    const item = await itemsRepo.getItemByIdOrSlug(
      idOrSlug,
      user?.userId ?? null,
    );
    if (!item) throw new AppError("Store item not found", 404);

    return ctx.json({ item });
  }

  async checkout(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) throw new AppError("Unauthorized", 401);

    const body = await ctx.req.json();
    const { itemId, paymentMethod } = body;
    if (!itemId) throw new AppError("Item ID is required", 400);

    if (paymentMethod === "credits") {
      const result = await itemsRepo.grantItemToUser(
        user.userId,
        itemId,
        "Platform Demo Credits",
      );
      return ctx.json(result);
    }

    const origin = ctx.req.header("origin") || ctx.req.header("referer");
    const result = await itemsRepo.createItemCheckout(user.userId, itemId, origin);
    return ctx.json(result);
  }

  async verifyPayment(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) throw new AppError("Unauthorized", 401);

    const body = await ctx.req.json();
    const { externalId } = body;
    if (!externalId) throw new AppError("Transaction reference required", 400);

    const result = await itemsRepo.verifyItemPayment(user.userId, externalId);
    return ctx.json(result);
  }
}
