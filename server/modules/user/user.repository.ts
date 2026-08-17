import { DbClient } from "@/server/database/client";
import { users } from "@/server/database/schemas/user";
import { eq, getTableColumns } from "drizzle-orm";

const {
  passwordHash,
  passwordResetToken,
  passwordResetExpires,
  ...publicColumns
} = getTableColumns(users);

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

  async findByResetToken(token: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token))
      .limit(1);
    return result[0] ?? null;
  }

  async setResetToken(userId: string, token: string, expires: Date) {
    await this.db
      .update(users)
      .set({ passwordResetToken: token, passwordResetExpires: expires })
      .where(eq(users.userId, userId));
  }

  async resetPassword(userId: string, passwordHash: string) {
    await this.db
      .update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .where(eq(users.userId, userId));
  }
}
