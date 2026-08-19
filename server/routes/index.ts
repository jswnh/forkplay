import { Hono } from "hono";
import { authRoutes } from "../modules/user/user.route";
import { gamesRoutes } from "../modules/games/games.route";
import { inboxRoutes } from "../modules/inbox/inbox.route";
import { storeRoutes } from "../modules/store/store.route";
import { achievementsRoutes } from "../modules/achievements/achievements.route";
import { profileRoutes } from "../modules/profile/profile.route";
import { uploadRoutes } from "../modules/upload/upload.route";
import { adminRoutes } from "../modules/admin/admin.route";
import { itemRoutes } from "../modules/items/items.route";
import { AppVariables } from "../context";

export const routes = new Hono<AppVariables>()
  .route("/", authRoutes)
  .route("/", gamesRoutes)
  .route("/", inboxRoutes)
  .route("/", storeRoutes)
  .route("/", achievementsRoutes)
  .route("/", profileRoutes)
  .route("/", uploadRoutes)
  .route("/", adminRoutes)
  .route("/", itemRoutes);
