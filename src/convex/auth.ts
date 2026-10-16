import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import GitHub from "@auth/core/providers/github";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { emailOtp } from "./auth/emailOtp";
import { normalizeEmail } from "./authCheck";

export function getBaseSiteUrl(): string {
  const siteUrl = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!siteUrl) {
    throw new Error("Missing SITE_URL or VERCEL_URL environment variable.");
  }
  return siteUrl.replace(/\/+$/, "");
}

// Fail with a clear error at startup if SITE_URL/VERCEL_URL is missing in production
if (process.env.NODE_ENV === "production") {
  getBaseSiteUrl();
}

export function resolveSafeRedirectUrl(
  target: string | undefined | null,
  configuredBaseUrl?: string,
): string {
  const baseUrl = (configuredBaseUrl ?? getBaseSiteUrl()).replace(/\/+$/, "");
  const baseOrigin = new URL(baseUrl).origin;

  const raw = (typeof target === "string" ? target : "/app").trim() || "/app";

  // Reject protocol-relative URLs (e.g. "//evil.com")
  if (raw.startsWith("//")) {
    return `${baseUrl}/app`;
  }

  // Relative paths starting with a single "/" (and not "//")
  if (raw.startsWith("/")) {
    return `${baseUrl}${raw}`;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.origin === baseOrigin) {
      return parsed.toString();
    }
  } catch {
    // Malformed URL falls back to app
  }

  return `${baseUrl}/app`;
}

const gitHubProvider = GitHub({
  clientId: process.env.AUTH_GITHUB_ID,
  clientSecret: process.env.AUTH_GITHUB_SECRET,
  allowDangerousEmailAccountLinking: false,
  profile(profile) {
    return {
      id: profile.id.toString(),
      name: profile.name ?? profile.login,
      email: profile.email ?? undefined,
      image: profile.avatar_url,
    };
  },
});

const rawAuth = convexAuth({
  providers: [gitHubProvider, emailOtp, Anonymous],
  signIn: {
    maxFailedAttempsPerHour: 5,
  },
  callbacks: {
    async redirect({ redirectTo }) {
      return resolveSafeRedirectUrl(redirectTo);
    },
  },
});

export const { auth, signOut, store, isAuthenticated } = rawAuth;

export const signIn = action({
  args: {
    provider: v.optional(v.string()),
    params: v.optional(v.any()),
    verifier: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    calledBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // GitHub configuration validation
    if (args.provider === "github" && (!process.env.AUTH_GITHUB_ID || !process.env.AUTH_GITHUB_SECRET)) {
      throw new Error("GitHub sign-in is not configured. Missing AUTH_GITHUB_ID or AUTH_GITHUB_SECRET.");
    }

    if (args.provider === "email-otp") {
      const params = args.params;
      if (!params || typeof params.email !== "string" || !params.email.trim()) {
        throw new Error("Enter a valid email");
      }

      const email = normalizeEmail(params.email);
      const isVerifyStep = params.code !== undefined;

      const check = await ctx.runMutation(
        internal.authCheck.verifyAndRateLimitAuthAttempt,
        {
          email,
          isVerifyStep,
        },
      );

      if (!check.allowed) {
        if (check.reason === "RATE_LIMITED") {
          throw new Error("Too many attempts, try again later");
        }
      }

      type ActionHandler = {
        _handler: (ctx: unknown, args: unknown) => Promise<unknown>;
      };
      return await (rawAuth.signIn as unknown as ActionHandler)._handler(ctx, args);
    }

    type ActionHandler = {
      _handler: (ctx: unknown, args: unknown) => Promise<unknown>;
    };
    return await (rawAuth.signIn as unknown as ActionHandler)._handler(ctx, args);
  },
});