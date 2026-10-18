import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { passwordProvider } from "./auth/password";

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
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: false,
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email ?? undefined,
                image: profile.picture,
              };
            },
          }),
        ]
      : []),
    gitHubProvider,
    passwordProvider,
    Anonymous,
  ],
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
    // Google configuration validation
    if (args.provider === "google" && (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET)) {
      throw new Error("Google sign-in is not configured. Missing AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET.");
    }

    // GitHub configuration validation
    if (args.provider === "github" && (!process.env.AUTH_GITHUB_ID || !process.env.AUTH_GITHUB_SECRET)) {
      throw new Error("GitHub sign-in is not configured. Missing AUTH_GITHUB_ID or AUTH_GITHUB_SECRET.");
    }

    type ActionHandler = {
      _handler: (ctx: unknown, args: unknown) => Promise<unknown>;
    };
    return await (rawAuth.signIn as unknown as ActionHandler)._handler(ctx, args);
  },
});