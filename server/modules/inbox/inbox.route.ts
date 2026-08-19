import { Hono } from "hono";
import { InboxController } from "./inbox.controller";
import { AppVariables } from "@/server/context";
import { AuthGuard } from "@/server/guards/auth.guard";

const controller = new InboxController();

export const inboxRoutes = new Hono<{ Variables: AppVariables }>()
  .basePath("/inbox")
  .get("/", AuthGuard.canActivate, controller.list)
  .get("/unread-count", AuthGuard.canActivate, controller.getUnreadCount)
  .get("/:id", AuthGuard.canActivate, controller.getById)
  .patch("/read-all", AuthGuard.canActivate, controller.markAllRead)
  .patch("/:id/read", AuthGuard.canActivate, controller.setRead)
  .patch("/:id/archive", AuthGuard.canActivate, controller.setArchived)
  .delete("/:id", AuthGuard.canActivate, controller.delete)
  .post("/compose", AuthGuard.canActivate, controller.compose);
