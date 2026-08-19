import { Hono } from "hono";
import { StoreController } from "./store.controller";
import { AppVariables } from "@/server/context";
import { AuthGuard } from "@/server/guards/auth.guard";

const controller = new StoreController();

export const storeRoutes = new Hono<{ Variables: AppVariables }>()
  .basePath("/store")
  .get("/", controller.list.bind(controller))
  .post("/purchase", AuthGuard.canActivate, controller.purchase.bind(controller))
  .post("/checkout-xendit", AuthGuard.canActivate, controller.checkoutXendit.bind(controller))
  .post("/verify-xendit", AuthGuard.canActivate, controller.verifyXendit.bind(controller));

