import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Masks an email for safe logging (e.g. a***@example.com -> a***@example.com).
 * Never exposes the full email in plain text in logs.
 */
export function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const [local, domain] = parts;
  if (!local || local.length <= 1) {
    return `*@${domain}`;
  }
  return `${local[0]}***@${domain}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_MAX_PER_HOUR = 5;
const GLOBAL_OTP_MAX_PER_HOUR = 200;
const ONE_HOUR_MS = 60 * 60 * 1000;

export const verifyAndRateLimitAuthAttempt = internalMutation({
  args: {
    email: v.string(),
    isVerifyStep: v.boolean(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);
    const emailIdentifier = `email:${normalizedEmail}`;
    const globalIdentifier = "global:otp";

    // Rate limiting is applied on code request (sending code)
    if (!args.isVerifyStep) {
      const now = Date.now();

      // Check global rate limit (max 200 per hour across all emails)
      const globalLimitDoc = await ctx.db
        .query("authRateLimits")
        .withIndex("identifier", (q) => q.eq("identifier", globalIdentifier))
        .unique();

      if (globalLimitDoc) {
        const elapsed = now - globalLimitDoc.lastAttemptTime;
        const recovered = elapsed * (GLOBAL_OTP_MAX_PER_HOUR / ONE_HOUR_MS);
        const attemptsLeft = Math.min(GLOBAL_OTP_MAX_PER_HOUR, globalLimitDoc.attemptsLeft + recovered);
        if (attemptsLeft < 1) {
          return { allowed: false, reason: "RATE_LIMITED" as const, normalizedEmail };
        }
        await ctx.db.patch(globalLimitDoc._id, {
          attemptsLeft: attemptsLeft - 1,
          lastAttemptTime: now,
        });
      } else {
        await ctx.db.insert("authRateLimits", {
          identifier: globalIdentifier,
          attemptsLeft: GLOBAL_OTP_MAX_PER_HOUR - 1,
          lastAttemptTime: now,
        });
      }

      // Check email rate limit (max 5 per hour)
      const emailLimitDoc = await ctx.db
        .query("authRateLimits")
        .withIndex("identifier", (q) => q.eq("identifier", emailIdentifier))
        .unique();

      if (emailLimitDoc) {
        const elapsed = now - emailLimitDoc.lastAttemptTime;
        const recovered = elapsed * (EMAIL_MAX_PER_HOUR / ONE_HOUR_MS);
        const attemptsLeft = Math.min(EMAIL_MAX_PER_HOUR, emailLimitDoc.attemptsLeft + recovered);
        if (attemptsLeft < 1) {
          return { allowed: false, reason: "RATE_LIMITED" as const, normalizedEmail };
        }
        await ctx.db.patch(emailLimitDoc._id, {
          attemptsLeft: attemptsLeft - 1,
          lastAttemptTime: now,
        });
      } else {
        await ctx.db.insert("authRateLimits", {
          identifier: emailIdentifier,
          attemptsLeft: EMAIL_MAX_PER_HOUR - 1,
          lastAttemptTime: now,
        });
      }
    }

    return { allowed: true, reason: null, normalizedEmail };
  },
});

/**
 * Read-only check for test automation
 */
export const checkAccountExistence = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", normalizedEmail))
      .collect();

    return {
      exists: users.some(
        (u) => u.emailVerificationTime !== undefined && u.isAnonymous !== true,
      ),
    };
  },
});
