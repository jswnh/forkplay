import { Hono } from "hono";
import { ProfileController } from "./profile.controller";
import { AppVariables } from "@/server/context";
import { AuthGuard } from "@/server/guards/auth.guard";

const controller = new ProfileController();

export const profileRoutes = new Hono<{ Variables: AppVariables }>()
  .basePath("/profile")
  .get("/", AuthGuard.canActivate, controller.getProfile);
