import { Hono } from "hono";
import { errorHandler } from "./middleware/error-handler";
import { routes } from "./routes";
import { AppVariables } from "./context";

const app = new Hono<AppVariables>()
  .basePath("/api")
  .onError(errorHandler)
  .route("/", routes);

export type AppType = typeof app;
export default app;
