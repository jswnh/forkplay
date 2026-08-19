import { hash } from "bcryptjs";
import { AppError } from "@/server/lib/app-error";
import type { AppContext, AppVariables } from "../../context";
import { UserRepository } from "./user.repository";
import { db } from "@/server/database/client";
import { users } from "@/server/database/schemas/user";
import { userGames } from "@/server/database/schemas/user-game";
import { userAchievements } from "@/server/database/schemas/user-achievement";
import { inboxMessages } from "@/server/database/schemas/inbox-message";
import { AuthController, AuthService } from "@/lib/auth";
import { sql, eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";
import { EmailService } from "@/lib/email/email.service";

const usersRepository = new UserRepository(db);

export class UserController {
  async signUp(ctx: AppContext) {
    const { email, password } = await ctx.req.json();

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    const existing = await usersRepository.findByEmail(email);
    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    const passwordHash = await hash(password, 10);
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        verificationToken: token,
        verificationExpires: expires,
      })
      .returning();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    try {
      await EmailService.sendVerificationEmail(email, verifyUrl);
    } catch (err) {
      console.error("Failed to send verification email:", err);
    }

    return ctx.json(
      {
        success: true,
        requireVerification: true,
        message: "Verification link dispatched to your email.",
      },
      201,
    );
  }

  async verifyEmail(ctx: AppContext) {
    const token = ctx.req.query("token");
    if (!token) {
      throw new AppError("Verification token is required", 400);
    }

    const user = await usersRepository.findByVerificationToken(token);
    if (!user || !user.verificationExpires) {
      throw new AppError("Invalid or expired verification token", 400);
    }

    if (user.verificationExpires < new Date()) {
      throw new AppError("Verification token has expired. Please request a new one.", 400);
    }

    await usersRepository.verifyEmail(user.userId);

    return ctx.json({
      success: true,
      message: "Email identity successfully verified. You can now sign in.",
    });
  }

  async resendVerification(ctx: AppContext) {
    const body = await ctx.req.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const user = await usersRepository.findByEmailWithPassword(email);
    if (!user) {
      return ctx.json({
        message: "If that email is registered and unverified, a verification link has been sent.",
      });
    }

    if (user.emailVerified) {
      return ctx.json({
        message: "This email is already verified. You can sign in directly.",
      });
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await usersRepository.setVerificationToken(user.userId, token, expires);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    await EmailService.sendVerificationEmail(email, verifyUrl, user.username);

    return ctx.json({
      success: true,
      message: "Verification email has been sent.",
    });
  }

  async session(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      return ctx.json({ user: null, stats: null });
    }

    // Get aggregated stats
    const [gamesStats] = await db
      .select({
        count: sql<number>`count(*)::int`,
        totalPlaytime: sql<number>`coalesce(sum(${userGames.playtimeMinutes}), 0)::int`,
      })
      .from(userGames)
      .where(eq(userGames.userId, user.userId));

    const [achievementsStats] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(userAchievements)
      .where(and(eq(userAchievements.userId, user.userId), eq(userAchievements.unlocked, true)));

    const [inboxStats] = await db
      .select({
        unreadCount: sql<number>`count(*)::int`,
      })
      .from(inboxMessages)
      .where(
        and(
          eq(inboxMessages.userId, user.userId),
          eq(inboxMessages.isRead, false),
          eq(inboxMessages.isDeleted, false),
        ),
      );

    const fullUser = await usersRepository.findByEmailWithPassword(user.email);
    const hasPassword = Boolean(fullUser?.passwordHash);
    const isGoogleUser = !hasPassword;

    const stats = {
      gamesCount: gamesStats?.count ?? 0,
      totalPlaytimeMinutes: gamesStats?.totalPlaytime ?? 0,
      achievementsCount: achievementsStats?.count ?? 0,
      unreadInboxCount: inboxStats?.unreadCount ?? 0,
    };

    return ctx.json({
      user: {
        ...user,
        hasPassword,
        isGoogleUser,
        emailVerified: fullUser?.emailVerified ?? null,
      },
      stats,
    });
  }

  async changePassword(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const fullUser = await usersRepository.findByEmailWithPassword(user.email);
    if (!fullUser || !fullUser.passwordHash) {
      throw new AppError(
        "Accounts signed in with Google do not have a password.",
        400,
      );
    }

    const body = await ctx.req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      throw new AppError("Current password and new password are required", 400);
    }

    if (newPassword.length < 6) {
      throw new AppError("New password must be at least 6 characters", 400);
    }

    const { compare } = await import("bcryptjs");
    const isValid = await compare(currentPassword, fullUser.passwordHash);
    if (!isValid) {
      throw new AppError("Incorrect current password", 400);
    }

    const newHash = await hash(newPassword, 10);
    await usersRepository.resetPassword(user.userId, newHash);

    return ctx.json({ success: true, message: "Password updated successfully" });
  }

  async checkUsername(ctx: AppContext) {
    const username = ctx.req.query("username");
    if (!username || username.trim().length < 3) {
      return ctx.json({ available: false, message: "Username must be at least 3 characters" });
    }

    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!regex.test(username)) {
      return ctx.json({
        available: false,
        message: "Only letters, numbers, and underscores are allowed (3-20 chars)",
      });
    }

    const existing = await usersRepository.findByUsername(username);
    return ctx.json({
      available: !existing,
      message: existing ? "Username is already taken" : "Username is available",
    });
  }

  async setUsername(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const body = await ctx.req.json();
    const username = body.username?.trim();

    if (!username || username.length < 3 || username.length > 20) {
      throw new AppError("Username must be between 3 and 20 characters", 400);
    }

    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(username)) {
      throw new AppError("Username can only contain alphanumeric characters and underscores", 400);
    }

    const existing = await usersRepository.findByUsername(username);
    if (existing && existing.userId !== user.userId) {
      throw new AppError("Username is already taken", 409);
    }

    const updatedUser = await usersRepository.updateUsername(user.userId, username);
    return ctx.json({ success: true, user: updatedUser });
  }

  async updateProfile(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const body = await ctx.req.json();
    const updatedUser = await usersRepository.updateProfile(user.userId, {
      displayName: body.displayName,
      bio: body.bio,
      avatarUrl: body.avatarUrl,
      bannerUrl: body.bannerUrl,
    });

    return ctx.json({ success: true, user: updatedUser });
  }

  async signOut(ctx: AppContext) {
    await AuthController.signOut({ redirect: false });
    return ctx.json({ success: true });
  }

  forgotPassword = async (c: AppContext) => {
    const body = await c.req.json();

    await AuthService.requestPasswordReset(body.email);

    return c.json({
      message: "If that email is registered, a reset link has been sent.",
    });
  };

  resetPassword = async (c: AppContext) => {
    const body = await c.req.json();

    await AuthService.resetPassword(body.token, body.password);

    return c.json({ success: true });
  };
}
