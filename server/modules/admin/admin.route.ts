import { Hono } from "hono";
import { AdminController } from "./admin.controller";
import { AppVariables } from "@/server/context";
import { AuthGuard } from "@/server/guards/auth.guard";

const controller = new AdminController();

export const adminRoutes = new Hono<{ Variables: AppVariables }>()
  .basePath("/admin")
  .get("/stats", AuthGuard.canActivate, controller.getStats.bind(controller))
  .post("/games", AuthGuard.canActivate, controller.createGame.bind(controller))
  .patch("/games/:id", AuthGuard.canActivate, controller.updateGame.bind(controller))
  .delete("/games/:id", AuthGuard.canActivate, controller.deleteGame.bind(controller))
  .get("/items", AuthGuard.canActivate, controller.listItems.bind(controller))
  .post("/items", AuthGuard.canActivate, controller.createItem.bind(controller))
  .patch("/items/:id", AuthGuard.canActivate, controller.updateItem.bind(controller))
  .delete("/items/:id", AuthGuard.canActivate, controller.deleteItem.bind(controller))
  .post("/achievements", AuthGuard.canActivate, controller.createAchievement.bind(controller))
  .patch("/achievements/:id", AuthGuard.canActivate, controller.updateAchievement.bind(controller))
  .delete("/achievements/:id", AuthGuard.canActivate, controller.deleteAchievement.bind(controller))
  .post("/broadcast", AuthGuard.canActivate, controller.broadcastAnnouncement.bind(controller));
