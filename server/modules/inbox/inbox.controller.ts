import { AppContext } from "@/server/context";
import { InboxRepository } from "./inbox.repository";
import { db } from "@/server/database/client";
import { AuthController } from "@/lib/auth";
import { AppError } from "@/server/lib/app-error";

const inboxRepo = new InboxRepository(db);

export class InboxController {
  async list(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      return ctx.json({ messages: [], unreadCount: 0 });
    }

    const query = ctx.req.query();
    const messages = await inboxRepo.listMessages(user.userId, {
      category: query.category,
      search: query.search,
      isArchived: query.isArchived === "true",
    });

    const unreadCount = await inboxRepo.getUnreadCount(user.userId);

    return ctx.json({ messages, unreadCount });
  }

  async getUnreadCount(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      return ctx.json({ unreadCount: 0 });
    }

    const unreadCount = await inboxRepo.getUnreadCount(user.userId);
    return ctx.json({ unreadCount });
  }

  async getById(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const messageId = ctx.req.param("id");
    if (!messageId) {
      throw new AppError("Message ID is required", 400);
    }
    const message = await inboxRepo.getMessageById(user.userId, messageId, true);

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    const unreadCount = await inboxRepo.getUnreadCount(user.userId);
    return ctx.json({ message, unreadCount });
  }

  async setRead(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const messageId = ctx.req.param("id");
    if (!messageId) {
      throw new AppError("Message ID is required", 400);
    }
    const body = await ctx.req.json();
    const isRead = body.isRead !== false;

    const message = await inboxRepo.setReadStatus(user.userId, messageId, isRead);
    const unreadCount = await inboxRepo.getUnreadCount(user.userId);

    return ctx.json({ success: true, message, unreadCount });
  }

  async markAllRead(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    await inboxRepo.markAllAsRead(user.userId);
    return ctx.json({ success: true, unreadCount: 0 });
  }

  async setArchived(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const messageId = ctx.req.param("id");
    if (!messageId) {
      throw new AppError("Message ID is required", 400);
    }
    const body = await ctx.req.json();
    const isArchived = body.isArchived !== false;

    const message = await inboxRepo.setArchivedStatus(
      user.userId,
      messageId,
      isArchived,
    );

    return ctx.json({ success: true, message });
  }

  async delete(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const messageId = ctx.req.param("id");
    if (!messageId) {
      throw new AppError("Message ID is required", 400);
    }
    await inboxRepo.deleteMessage(user.userId, messageId);
    const unreadCount = await inboxRepo.getUnreadCount(user.userId);

    return ctx.json({ success: true, unreadCount });
  }

  async compose(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const body = await ctx.req.json();
    const created = await inboxRepo.createMessage({
      userId: user.userId,
      senderId: user.userId,
      senderName: user.displayName || user.username || "Commander",
      senderAvatar: user.avatarUrl,
      type: body.type || "social",
      title: body.title || "New Message",
      body: body.body || "",
      metadata: body.metadata || {},
      isRead: false,
    });

    const unreadCount = await inboxRepo.getUnreadCount(user.userId);
    return ctx.json({ success: true, message: created, unreadCount }, 201);
  }
}
