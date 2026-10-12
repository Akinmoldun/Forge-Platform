import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});

/**
 * Updates the current user's display name.
 */
export const updateDisplayName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    const name = args.name.trim();
    if (name.length < 1 || name.length > 50) {
      throw new Error("Display name must be between 1 and 50 characters");
    }
    await ctx.db.patch(userId, { name });
    return { ok: true, name };
  },
});

/**
 * Generates an upload URL for avatar upload into Convex file storage.
 */
export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Updates the current user's profile information (display name, job title, timezone, avatar).
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    timezone: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    avatarKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const patch: Record<string, unknown> = {};

    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length < 1 || name.length > 60) {
        throw new Error("Display name must be between 1 and 60 characters");
      }
      patch.name = name;
    }

    if (args.jobTitle !== undefined) {
      patch.jobTitle = args.jobTitle.trim() || undefined;
    }

    if (args.timezone !== undefined) {
      patch.timezone = args.timezone.trim() || undefined;
    }

    if (args.avatarKey !== undefined) {
      patch.avatarKey = args.avatarKey.trim() || undefined;
    }

    if (args.avatarStorageId !== undefined) {
      const imageUrl = await ctx.storage.getUrl(args.avatarStorageId);
      patch.avatarStorageId = args.avatarStorageId;
      patch.image = imageUrl ?? undefined;
    }

    await ctx.db.patch(userId, patch);
    return { ok: true };
  },
});

/**
 * Updates the current user's chosen illustration avatar.
 */
export const updateAvatarKey = mutation({
  args: {
    avatarKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");
    await ctx.db.patch(userId, { avatarKey: args.avatarKey.trim() || undefined });
    return { ok: true };
  },
});

/**
 * Removes the current user's avatar.
 */
export const removeAvatar = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    await ctx.db.patch(userId, {
      image: undefined,
      avatarStorageId: undefined,
    });
    return { ok: true };
  },
});

/**
 * Updates notification preferences (email toggles).
 */
export const updateNotificationPreferences = mutation({
  args: {
    emailMentions: v.optional(v.boolean()),
    emailAssigned: v.optional(v.boolean()),
    emailComments: v.optional(v.boolean()),
    emailStatus: v.optional(v.boolean()),
    emailInvites: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const patch: Record<string, unknown> = {};
    if (args.emailMentions !== undefined) patch.emailMentions = args.emailMentions;
    if (args.emailAssigned !== undefined) patch.emailAssigned = args.emailAssigned;
    if (args.emailComments !== undefined) patch.emailComments = args.emailComments;
    if (args.emailStatus !== undefined) patch.emailStatus = args.emailStatus;
    if (args.emailInvites !== undefined) patch.emailInvites = args.emailInvites;

    await ctx.db.patch(userId, patch);
    return { ok: true };
  },
});

/**
 * Triggers a welcome email if the user is a real account and hasn't received it yet.
 */
export const ensureWelcomeEmail = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { ok: false };
    const user = await ctx.db.get(userId);
    if (!user || user.isAnonymous || !user.email) return { ok: false };
    if (user.email.endsWith("@demo.invalid")) return { ok: false };
    if (user.welcomeEmailSent) return { ok: true, alreadySent: true };

    await ctx.db.patch(userId, { welcomeEmailSent: true });
    ctx.scheduler.runAfter(0, internal.email.sendWelcomeEmail, { userId });
    return { ok: true, sent: true };
  },
});


