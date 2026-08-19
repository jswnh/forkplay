// src/lib/email/email.service.ts
import { AppError } from "@/server/lib/app-error";
import { resend } from "./resend.client";

export class EmailService {
  static sendVerificationEmail = async (
    email: string,
    verifyUrl: string,
    username?: string | null,
  ) => {
    const operatorName = username ? `@${username}` : "Operator";

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your ForkPlay Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #0b0f19; border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 20px; overflow: hidden; box-shadow: 0 0 40px rgba(6, 182, 212, 0.15);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <div style="display: inline-block; padding: 8px 16px; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 9999px; margin-bottom: 16px;">
                <span style="font-size: 11px; font-family: monospace; font-weight: bold; color: #06b6d4; letter-spacing: 2px; text-transform: uppercase;">
                  FORKPLAY // IDENTITY CLEARANCE
                </span>
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Verify Your Operator Account
              </h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: #9ca3af;">
                Welcome to the ForkPlay Gaming Network, ${operatorName}.
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #d1d5db;">
                A new operator access profile was initiated for <strong>${email}</strong>. Confirm your email address to unlock full library deployment, trophy synchronization, and digital store access.
              </p>

              <!-- CTA Button Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); color: #ffffff; font-size: 13px; font-weight: bold; font-family: monospace; text-decoration: none; border-radius: 12px; box-shadow: 0 0 25px rgba(6, 182, 212, 0.4); letter-spacing: 0.5px;">
                      AUTHORIZE & VERIFY EMAIL &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                Or copy and paste this verification URL into your browser:
              </p>

              <div style="background-color: #030712; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; word-break: break-all; font-family: monospace; font-size: 11px; color: #38bdf8;">
                ${verifyUrl}
              </div>

              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                <p style="margin: 0; font-size: 11px; color: #6b7280; line-height: 1.5;">
                  ⚠️ This authorization link expires in 24 hours. If you did not create this account, no further action is required.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #070a12; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; font-family: monospace; color: #4b5563;">
                FORKPLAY CLOUD GAMING PLATFORM • ALL RIGHTS RESERVED
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { error } = await resend.emails.send({
      from: "Forkplay <onboarding@resend.dev>",
      to: email,
      subject: "⚡ Action Required: Verify your ForkPlay account",
      html: htmlContent,
    });

    if (error) {
      throw new AppError("Failed to send verification email", 500);
    }
  };

  static sendPasswordReset = async (email: string, resetUrl: string) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your ForkPlay Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #0b0f19; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 20px; overflow: hidden; box-shadow: 0 0 40px rgba(239, 68, 68, 0.15);">
          
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <div style="display: inline-block; padding: 8px 16px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 9999px; margin-bottom: 16px;">
                <span style="font-size: 11px; font-family: monospace; font-weight: bold; color: #f87171; letter-spacing: 2px; text-transform: uppercase;">
                  SECURITY ALERT // CREDENTIAL OVERRIDE
                </span>
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Reset Password Requested
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #d1d5db;">
                A credential reset request was submitted for your operator profile (<strong>${email}</strong>). Click below to create a new password.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; font-size: 13px; font-weight: bold; font-family: monospace; text-decoration: none; border-radius: 12px; box-shadow: 0 0 25px rgba(239, 68, 68, 0.4); letter-spacing: 0.5px;">
                      RESET PASSWORD &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                <p style="margin: 0; font-size: 11px; color: #6b7280; line-height: 1.5;">
                  ⚠️ This reset link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { error } = await resend.emails.send({
      from: "Forkplay <onboarding@resend.dev>",
      to: email,
      subject: "🔒 Security Alert: Reset your ForkPlay password",
      html: htmlContent,
    });

    if (error) {
      throw new AppError("Failed to send reset email", 500);
    }
  };
}
