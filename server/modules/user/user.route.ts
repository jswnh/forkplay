import { Hono } from "hono";
import { UserController } from "./user.controller";
import { AppVariables } from "@/server/context";

const controller = new UserController();

const authRoutes = new Hono<{ Variables: AppVariables }>()
  .basePath("/user")
  .post("/sign-up", controller.signUp);

export { authRoutes };
