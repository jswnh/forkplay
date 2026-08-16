import { DbClient } from "@/server/database/client";
import { users } from "@/server/database/schemas/user";
import { eq } from "drizzle-orm";

export class UserRepository {
  constructor(private db: DbClient) {}
  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] ?? null;
  }
}
