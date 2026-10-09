import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Masks an email for safe logging (e.g. akineroeditzfortittok@gmail.com -> a***@gmail.com).
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
const IP_MAX_PER_HOUR = 20;
const ONE_HOUR_MS = 60 * 60 * 1000;

export const verifyAndRateLimitAuthAttempt = internalMutation({
  args: {
    email: v.string(),
    mode: v.union(v.literal("signin"), v.literal("signup")),
    isVerifyStep: v.boolean(),
    clientIp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);
    const clientIdentifier = args.clientIp ? `ip:${args.clientIp}` : "ip:default";
    const emailIdentifier = `email:${normalizedEmail}`;

    // Rate limiting is applied on code request (existence check & sending code)
    if (!args.isVerifyStep) {
      const now = Date.now();

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

      // Check IP rate limit (max 20 per hour)
      const ipLimitDoc = await ctx.db
        .query("authRateLimits")
        .withIndex("identifier", (q) => q.eq("identifier", clientIdentifier))
        .unique();

      if (ipLimitDoc) {
        const elapsed = now - ipLimitDoc.lastAttemptTime;
        const recovered = elapsed * (IP_MAX_PER_HOUR / ONE_HOUR_MS);
        const attemptsLeft = Math.min(IP_MAX_PER_HOUR, ipLimitDoc.attemptsLeft + recovered);
        if (attemptsLeft < 1) {
          return { allowed: false, reason: "RATE_LIMITED" as const, normalizedEmail };
        }
        await ctx.db.patch(ipLimitDoc._id, {
          attemptsLeft: attemptsLeft - 1,
          lastAttemptTime: now,
        });
      } else {
        await ctx.db.insert("authRateLimits", {
          identifier: clientIdentifier,
          attemptsLeft: IP_MAX_PER_HOUR - 1,
          lastAttemptTime: now,
        });
      }
    }

    // Account existence check:
    // A real account has email matching normalizedEmail, emailVerificationTime defined,
    // and is not anonymous. An unverified account or guest account does NOT count.
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", normalizedEmail))
      .collect();

    const hasVerifiedAccount = users.some(
      (u) => u.emailVerificationTime !== undefined && u.isAnonymous !== true,
    );

    if (args.mode === "signin") {
      if (!hasVerifiedAccount) {
        return { allowed: false, reason: "NOT_FOUND" as const, normalizedEmail };
      }
    } else if (args.mode === "signup") {
      if (hasVerifiedAccount) {
        return { allowed: false, reason: "ALREADY_EXISTS" as const, normalizedEmail };
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
