import { Hono } from "hono";
import { ItemsController } from "./items.controller";
import { AppVariables } from "@/server/context";
import { AuthGuard } from "@/server/guards/auth.guard";

const controller = new ItemsController();

const itemRoutes = new Hono<{ Variables: AppVariables }>()
  .basePath("/items")
  .get("/", controller.list.bind(controller))
  .get("/:idOrSlug", controller.getByIdOrSlug.bind(controller))
  .post("/checkout", AuthGuard.canActivate, controller.checkout.bind(controller))
  .post("/verify-payment", AuthGuard.canActivate, controller.verifyPayment.bind(controller));

export { itemRoutes };
