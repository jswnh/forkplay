import type { ErrorHandler } from "hono";
import { AppError } from "../lib/app-error";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
};
