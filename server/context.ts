import type { Context } from "hono";
import type { Session } from "next-auth";

export type AppVariables = {
  Variables: {
    requestId: string;
    session: Session;
  };
};

export type AppContext = Context<AppVariables>;
