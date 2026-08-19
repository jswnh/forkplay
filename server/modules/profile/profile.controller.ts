import { AppContext } from "@/server/context";
import { ProfileRepository } from "./profile.repository";
import { db } from "@/server/database/client";
import { AuthController } from "@/lib/auth";
import { AppError } from "@/server/lib/app-error";

const profileRepo = new ProfileRepository(db);

export class ProfileController {
  async getProfile(ctx: AppContext) {
    const user = await AuthController.getCurrentUser();
    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    const data = await profileRepo.getProfileData(user.userId);
    if (!data) {
      throw new AppError("User not found", 404);
    }

    return ctx.json(data);
  }
}
