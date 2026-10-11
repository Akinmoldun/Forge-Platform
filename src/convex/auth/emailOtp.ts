import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { ConvexError } from "convex/values";
import { maskEmail, normalizeEmail } from "../authCheck";
import { sendEmailDirect } from "../email/index";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 10, // 10 minutes (expires in 10 minutes or less)
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },
  authorize: async (params, account) => {
    if (typeof params.email !== "string") {
      throw new Error(
        "Token verification requires an `email` in params of `signIn`.",
      );
    }
    const normalized = normalizeEmail(params.email);
    const providerAccountId =
      typeof account?.providerAccountId === "string"
        ? account.providerAccountId
        : String(account?.providerAccountId ?? "");
    if (providerAccountId.trim().toLowerCase() !== normalized) {
      throw new Error(
        "Short verification code requires a matching `email` in params of `signIn`.",
      );
    }
  },
  async sendVerificationRequest({ identifier: rawEmail, token }) {
    const email = normalizeEmail(rawEmail);

    // DEV ONLY, remove before launch
    if (process.env.ALLOW_DEV_OTP_LOG === "true") {
      console.log(`[auth:dev-otp] One-time code for ${maskEmail(email)}: ${token}`);
    }

    const subject = `Your Forge verification code: ${token}`;
    const text = `Your Forge verification code is: ${token}. This code expires in 10 minutes.`;
    const html = `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:32px 32px 16px;">
                <h1 style="margin:0 0 8px;font-size:20px;line-height:1.3;color:#111827;">
                  Your verification code
                </h1>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
                  Use this 6-digit code to complete sign-in to Forge. It expires in 10 minutes.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 24px;">
                <div style="background:#f3f4f6;border-radius:8px;padding:16px;text-align:center;font-size:32px;font-weight:700;letter-spacing:6px;font-family:monospace;color:#111827;">
                  ${token}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 28px;border-top:1px solid #f3f4f6;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;">
                  If you did not request this email, you can safely ignore it.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    try {
      const res = await sendEmailDirect({
        to: email,
        subject,
        html,
        text,
      });
      if (!res.ok) {
        throw new ConvexError(res.reason || "Failed to send verification code");
      }
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Email isn't set up yet")) {
        throw new ConvexError("Email isn't set up yet");
      }
      throw err;
    }
  },
});
