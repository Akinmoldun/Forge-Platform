import { internalQuery } from "./_generated/server";
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
        (u) => u.isAnonymous !== true,
      ),
    };
  },
});
