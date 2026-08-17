import { DbClient } from "@/server/database/client";
import { users } from "@/server/database/schemas/user";
import { eq, getTableColumns } from "drizzle-orm";

const { passwordHash, ...publicColumns } = getTableColumns(users);

export class UserRepository {
  constructor(private db: DbClient) {}

  async findByEmail(email: string) {
    const result = await this.db
      .select(publicColumns)
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] ?? null;
  }

  async findByEmailWithPassword(email: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] ?? null;
  }

  async findById(userId: string) {
    const result = await this.db
      .select(publicColumns)
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    return result[0] ?? null;
  }
}
