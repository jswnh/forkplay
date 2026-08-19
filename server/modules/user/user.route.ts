import { Hono } from "hono";
import { UserController } from "./user.controller";
import { AppVariables } from "@/server/context";
import { AuthGuard } from "@/server/guards/auth.guard";

const controller = new UserController();

const authRoutes = new Hono<{ Variables: AppVariables }>()
  .basePath("/user")
  .post("/sign-up", controller.signUp.bind(controller))
  .get("/verify-email", controller.verifyEmail.bind(controller))
  .post("/resend-verification", controller.resendVerification.bind(controller))
  .get("/session", controller.session.bind(controller))
  .get("/check-username", controller.checkUsername.bind(controller))
  .post("/username", AuthGuard.canActivate, controller.setUsername.bind(controller))
  .patch("/profile", AuthGuard.canActivate, controller.updateProfile.bind(controller))
  .post("/change-password", AuthGuard.canActivate, controller.changePassword.bind(controller))
  .get("/sign-out", AuthGuard.canActivate, controller.signOut.bind(controller))
  .post("/forgot-password", controller.forgotPassword.bind(controller))
  .post("/reset-password", controller.resetPassword.bind(controller));

export { authRoutes };
