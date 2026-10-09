import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { maskEmail, normalizeEmail } from "../authCheck";

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
    if (account.providerAccountId.trim().toLowerCase() !== normalized) {
      throw new Error(
        "Short verification code requires a matching `email` in params of `signIn`.",
      );
    }
  },
  async sendVerificationRequest({ identifier: rawEmail, token }) {
    const email = normalizeEmail(rawEmail);
    const apiKey = process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error(
        "[auth] Missing AUTH_RESEND_KEY (or RESEND_API_KEY) in Convex deployment environment variables. Email could not be sent.",
      );
      throw new Error(
        "Email service is not configured. Please set AUTH_RESEND_KEY in your Convex deployment environment variables.",
      );
    }

    const from = process.env.EMAIL_FROM || "Forge <onboarding@resend.dev>";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: `Your Forge verification code: ${token}`,
          html: `
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
</html>`,
          text: `Your Forge verification code is: ${token}. This code expires in 10 minutes.`,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[auth] Resend API rejected email to ${maskEmail(email)} (HTTP ${response.status}):`,
          errorText,
        );
        throw new Error(`Email provider rejected request (HTTP ${response.status})`);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        console.error("[auth] Email request timed out after 10 seconds.");
        throw new Error("Email service timed out. Please try again.");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  },
});
