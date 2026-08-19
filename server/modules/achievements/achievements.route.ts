import { Hono } from "hono";
import { AchievementsController } from "./achievements.controller";
import { AppVariables } from "@/server/context";
import { AuthGuard } from "@/server/guards/auth.guard";

const controller = new AchievementsController();

export const achievementsRoutes = new Hono<{ Variables: AppVariables }>()
  .basePath("/achievements")
  .get("/", controller.list)
  .post("/:id/unlock", AuthGuard.canActivate, controller.unlock);
