import { Hono } from "hono";
import { GamesController } from "./games.controller";
import { AppVariables } from "@/server/context";
import { AuthGuard } from "@/server/guards/auth.guard";

const controller = new GamesController();

export const gamesRoutes = new Hono<{ Variables: AppVariables }>()
  .basePath("/games")
  .get("/", controller.list)
  .get("/featured", controller.getFeatured)
  .get("/:idOrSlug", controller.getByIdOrSlug)
  .post("/:id/favorite", AuthGuard.canActivate, controller.toggleFavorite)
  .post("/:id/play", AuthGuard.canActivate, controller.recordPlaySession)
  .post("/:id/add-to-library", AuthGuard.canActivate, controller.addToLibrary);
