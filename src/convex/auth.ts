// THIS FILE IS READ ONLY. Do not touch this file unless you are correctly adding a new auth provider in accordance to the vly auth documentation

import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { emailOtp } from "./auth/emailOtp";


import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { emailOtp } from "./auth/emailOtp";
import { normalizeEmail } from "./authCheck";

const rawAuth = convexAuth({
  providers: [emailOtp, Anonymous],
  signIn: {
    maxFailedAttempsPerHour: 5,
  },
});

export const { auth, signOut, store, isAuthenticated } = rawAuth;

async function constantTimeDelay(targetMs = 350) {
  const jitter = Math.floor(Math.random() * 100);
  await new Promise((resolve) => setTimeout(resolve, targetMs + jitter));
}

export const signIn = action({
  args: {
    provider: v.optional(v.string()),
    params: v.optional(v.any()),
    verifier: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    calledBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Guest (anonymous) sign-in and token refreshes pass through directly
    if (args.provider === "anonymous" || args.refreshToken !== undefined) {
      return await (rawAuth.signIn as any)._handler(ctx, args);
    }

    if (args.provider === "email-otp") {
      const params = args.params;
      if (!params || typeof params.email !== "string" || !params.email.trim()) {
        throw new Error("Enter a valid email");
      }

      const email = normalizeEmail(params.email);
      const rawMode = params.mode;
      if (rawMode !== "signin" && rawMode !== "signup") {
        throw new Error("Invalid authentication mode. Must be 'signin' or 'signup'.");
      }
      const mode: "signin" | "signup" = rawMode;
      const isVerifyStep = params.code !== undefined;
      const clientIp = typeof params.clientIp === "string" ? params.clientIp : undefined;

      const check = await ctx.runMutation(
        internal.authCheck.verifyAndRateLimitAuthAttempt,
        {
          email,
          mode,
          isVerifyStep,
          clientIp,
        },
      );

      if (!check.allowed) {
        if (check.reason === "RATE_LIMITED") {
          throw new Error("Too many attempts, try again later");
        }
        if (check.reason === "NOT_FOUND") {
          await constantTimeDelay();
          throw new Error("We couldn't find an account with this email.");
        }
        if (check.reason === "ALREADY_EXISTS") {
          await constantTimeDelay();
          throw new Error("An account with this email already exists.");
        }
      }

      // Ensure normalized email is used downstream
      args.params.email = check.normalizedEmail;
      return await (rawAuth.signIn as any)._handler(ctx, args);
    }

    return await (rawAuth.signIn as any)._handler(ctx, args);
  },
});