import { Hono } from "hono";
import { UserController } from "./user.controller";
import { AppVariables } from "@/server/context";
import { AuthGuard } from "@/server/guards/auth.guard";

const controller = new UserController();

const authRoutes = new Hono<{ Variables: AppVariables }>()
  .basePath("/user")
  .post("/sign-up", controller.signUp)
  .get("/session", AuthGuard.canActivate, controller.session)
  .get("/sign-out", AuthGuard.canActivate, controller.signOut);

export { authRoutes };
