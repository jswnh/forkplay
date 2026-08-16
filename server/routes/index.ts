import { Hono } from "hono";
import { authRoutes } from "../modules/user/user.route";
import { AppVariables } from "../context";

export const routes = new Hono<AppVariables>().route("/", authRoutes);
