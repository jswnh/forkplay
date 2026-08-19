import { AppContext } from "@/server/context";
import { AdminRepository } from "./admin.repository";
import { db } from "@/server/database/client";
import { AuthController } from "@/lib/auth";
import { AppError } from "@/server/lib/app-error";

const adminRepo = new AdminRepository(db);

export class AdminController {
  private async ensureAdmin() {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }
    if (user.role !== "admin") {
      throw new AppError("Forbidden: Operator lacks Platform Overseer credentials", 403);
    }
    return user;
  }

  async getStats(ctx: AppContext) {
    await this.ensureAdmin();
    const stats = await adminRepo.getPlatformStats();
    const recentTransactions = await adminRepo.listRecentTransactions(15);
    const items = await adminRepo.listItems();
    return ctx.json({ stats, recentTransactions, items });
  }

  async createGame(ctx: AppContext) {
    await this.ensureAdmin();
    const body = await ctx.req.json();

    if (!body.title || !body.slug) {
      throw new AppError("Title and slug are required", 400);
    }

    const newGame = await adminRepo.createGame({
      title: body.title.trim(),
      slug: body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      description: body.description || "",
      shortDescription: body.shortDescription || "",
      coverUrl:
        body.coverUrl ||
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
      bannerUrl: body.bannerUrl || null,
      genre: body.genre || "Action RPG",
      tags: Array.isArray(body.tags) ? body.tags : ["Sci-Fi", "Cyberpunk"],
      price: Number(body.price ?? 0),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
      developer: body.developer || "ForkPlay Studios",
      publisher: body.publisher || "ForkPlay Interactive",
      downloadSize: body.downloadSize || "14.2 GB",
      rating: Number(body.rating ?? 4.8),
      ratingCount: 1,
      isFeatured: Boolean(body.isFeatured),
      isNewRelease: Boolean(body.isNewRelease ?? true),
      isPopular: Boolean(body.isPopular),
    });

    return ctx.json({ success: true, game: newGame }, 201);
  }

  async updateGame(ctx: AppContext) {
    await this.ensureAdmin();
    const gameId = ctx.req.param("id");
    if (!gameId) {
      throw new AppError("Game ID is required", 400);
    }
    const body = await ctx.req.json();

    const updated = await adminRepo.updateGame(gameId, body);
    if (!updated) {
      throw new AppError("Game not found", 404);
    }

    return ctx.json({ success: true, game: updated });
  }

  async deleteGame(ctx: AppContext) {
    await this.ensureAdmin();
    const gameId = ctx.req.param("id");
    if (!gameId) {
      throw new AppError("Game ID is required", 400);
    }

    const deleted = await adminRepo.deleteGame(gameId);
    return ctx.json({ success: true, game: deleted });
  }

  async listItems(ctx: AppContext) {
    await this.ensureAdmin();
    const items = await adminRepo.listItems();
    return ctx.json({ items });
  }

  async createItem(ctx: AppContext) {
    await this.ensureAdmin();
    const body = await ctx.req.json();

    if (!body.name || !body.slug) {
      throw new AppError("Item name and slug are required", 400);
    }

    const newItem = await adminRepo.createItem({
      name: body.name.trim(),
      slug: body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      description: body.description || "",
      shortDescription: body.shortDescription || "",
      category: body.category || "dlc",
      gameId: body.gameId || null,
      price: Number(body.price ?? 0),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
      imageUrl:
        body.imageUrl ||
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
      rarity: body.rarity || "rare",
      isFeatured: Boolean(body.isFeatured),
      isActive: Boolean(body.isActive ?? true),
      metadata: body.metadata || null,
    });

    return ctx.json({ success: true, item: newItem }, 201);
  }

  async updateItem(ctx: AppContext) {
    await this.ensureAdmin();
    const itemId = ctx.req.param("id");
    if (!itemId) throw new AppError("Item ID is required", 400);

    const body = await ctx.req.json();
    const updated = await adminRepo.updateItem(itemId, body);
    if (!updated) throw new AppError("Item not found", 404);

    return ctx.json({ success: true, item: updated });
  }

  async deleteItem(ctx: AppContext) {
    await this.ensureAdmin();
    const itemId = ctx.req.param("id");
    if (!itemId) throw new AppError("Item ID is required", 400);

    const deleted = await adminRepo.deleteItem(itemId);
    return ctx.json({ success: true, item: deleted });
  }

  async createAchievement(ctx: AppContext) {
    await this.ensureAdmin();
    const body = await ctx.req.json();

    if (!body.gameId || !body.title) {
      throw new AppError("Game ID and achievement title are required", 400);
    }

    const newAch = await adminRepo.createAchievement({
      gameId: body.gameId,
      key:
        body.key ||
        body.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      title: body.title.trim(),
      description: body.description || "Milestone reached.",
      iconUrl:
        body.iconUrl ||
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=400&auto=format&fit=crop",
      points: Number(body.points ?? 50),
      rarity: body.rarity || "rare",
      maxProgress: Number(body.maxProgress ?? 1),
    });

    return ctx.json({ success: true, achievement: newAch }, 201);
  }

  async updateAchievement(ctx: AppContext) {
    await this.ensureAdmin();
    const achId = ctx.req.param("id");
    if (!achId) throw new AppError("Achievement ID is required", 400);

    const body = await ctx.req.json();
    const updated = await adminRepo.updateAchievement(achId, body);
    if (!updated) throw new AppError("Achievement not found", 404);

    return ctx.json({ success: true, achievement: updated });
  }

  async deleteAchievement(ctx: AppContext) {
    await this.ensureAdmin();
    const achId = ctx.req.param("id");
    if (!achId) throw new AppError("Achievement ID is required", 400);

    const deleted = await adminRepo.deleteAchievement(achId);
    return ctx.json({ success: true, achievement: deleted });
  }

  async broadcastAnnouncement(ctx: AppContext) {
    await this.ensureAdmin();
    const body = await ctx.req.json();

    if (!body.title || !body.body) {
      throw new AppError("Subject title and message body are required", 400);
    }

    const result = await adminRepo.broadcastAnnouncement({
      title: body.title.trim(),
      body: body.body.trim(),
      actionUrl: body.actionUrl,
      actionLabel: body.actionLabel,
    });

    return ctx.json({ success: true, ...result });
  }
}
