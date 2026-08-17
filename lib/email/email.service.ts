// src/lib/email/email.service.ts
import { AppError } from "@/server/lib/app-error";
import { resend } from "./resend.client";
export class EmailService {
  static sendPasswordReset = async (email: string, resetUrl: string) => {
    const { error } = await resend.emails.send({
      from: "Forkplay <onboarding@resend.dev>", // swap once you verify your own domain
      to: email,
      subject: "Reset your password",
      html: `
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    if (error) {
      throw new AppError("Failed to send reset email", 500);
    }
  };
}
