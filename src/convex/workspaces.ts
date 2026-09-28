import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import {
  createNotification,
  findWorkspaceContext,
  getMembership,
  loadWorkspaceContext,
  recordEvent,
  requireUser,
  roleAtLeast,
} from "./lib/auth";
import type { Id } from "./_generated/dataModel";

const DEFAULT_WORKFLOW = [
  { name: "Backlog", category: "backlog" as const, color: "#8b8b93" },
  { name: "Todo", category: "backlog" as const, color: "#7a7a85" },
  { name: "In Progress", category: "active" as const, color: "#4f8ff7" },
  { name: "Review", category: "review" as const, color: "#b98af5" },
  { name: "Done", category: "completed" as const, color: "#3ecf8e" },
  { name: "Cancelled", category: "cancelled" as const, color: "#f06a6a" },
];

// Allowed transitions of the default workflow: forward flow + reopen paths
const DEFAULT_TRANSITIONS: Array<[string, string]> = [
  ["Backlog", "Todo"],
  ["Backlog", "In Progress"],
  ["Todo", "In Progress"],
  ["Todo", "Backlog"],
  ["In Progress", "Review"],
  ["In Progress", "Todo"],
  ["Review", "Done"],
  ["Review", "In Progress"],
  ["Review", "Changes Requested"],
  ["Done", "In Progress"],
  ["Cancelled", "Backlog"],
];

export const DEFAULT_STATUS_ROWS = [
  ...DEFAULT_WORKFLOW.slice(0, 4),
  { name: "Changes Requested", category: "review" as const, color: "#e6a23c" },
  ...DEFAULT_WORKFLOW.slice(4),
];

export const DEFAULT_TRANSITION_PAIRS = DEFAULT_TRANSITIONS;

const DEFAULT_LABELS = [
  { name: "bug", color: "#f06a6a" },
  { name: "feature", color: "#3ecf8e" },
  { name: "improvement", color: "#4f8ff7" },
  { name: "needs-review", color: "#b98af5" },
  { name: "docs", color: "#8b8b93" },
];

export const createWorkspace = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const name = args.name.trim();
    if (name.length < 2 || name.length > 60) {
      throw new Error("Workspace name must be 2-60 characters");
    }

    // unique slug derived from the name
    const base =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "workspace";
    let slug = base;
    let n = 1;
    while (
      await ctx.db
        .query("workspaces")
        .withIndex("slug", (q) => q.eq("slug", slug))
        .unique()
    ) {
      slug = `${base}-${++n}`;
    }

    const now = Date.now();
    const workspaceId = await ctx.db.insert("workspaces", {
      name,
      slug,
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("memberships", {
      workspaceId,
      userId: user._id,
      role: "owner",
      joinedAt: now,
    });

    for (const label of DEFAULT_LABELS) {
      await ctx.db.insert("labels", {
        workspaceId,
        name: label.name,
        color: label.color,
      });
    }

    await recordEvent(ctx, {
      workspaceId,
      actorId: user._id,
      entityType: "workspace",
      entityId: workspaceId,
      eventType: "workspace.created",
      payload: { name },
    });

    return { workspaceId, slug };
  },
});

export const listMyWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return Promise.all(
      memberships.map(async (m) => {
        const workspace = await ctx.db.get(m.workspaceId);
        if (!workspace) return null;
        const projectCount = (
          await ctx.db
            .query("projects")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", m.workspaceId))
            .collect()
        ).filter((p) => p.status !== "archived").length;
        const memberCount = (
          await ctx.db
            .query("memberships")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", m.workspaceId))
            .collect()
        ).length;
        return { ...workspace, role: m.role, projectCount, memberCount };
      }),
    ).then((rows) => rows.filter((r): r is NonNullable<typeof r> => r !== null));
  },
});

export const getWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const ctxData = await findWorkspaceContext(ctx, args.workspaceId);
    if (!ctxData) return null;
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    const members = await ctx.db
      .query("memberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return {
      workspace: ctxData.workspace,
      role: ctxData.role,
      projectCount: projects.filter((p) => p.status !== "archived").length,
      memberCount: members.length,
    };
  },
});

export const renameWorkspace = mutation({
  args: { workspaceId: v.id("workspaces"), name: v.string() },
  handler: async (ctx, args) => {
    const { workspaceId, userId, workspace } = await loadWorkspaceContext(
      ctx,
      args.workspaceId,
    );
    if (workspace.ownerId !== userId) {
      throw new Error("Only the workspace owner can rename it");
    }
    const name = args.name.trim();
    if (name.length < 2 || name.length > 60) {
      throw new Error("Workspace name must be 2-60 characters");
    }
    await ctx.db.patch(workspaceId, { name, updatedAt: Date.now() });
    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "workspace",
      entityId: workspaceId,
      eventType: "workspace.updated",
      payload: { field: "name", new_value: name },
    });
  },
});

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export const listMembers = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const workspaceCtx = await findWorkspaceContext(ctx, args.workspaceId);
    if (!workspaceCtx) return [];
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          membershipId: m._id,
          userId: m.userId,
          role: m.role,
          joinedAt: m.joinedAt,
          name: user?.name ?? "Unknown",
          email: user?.email ?? "",
          image: user?.image,
        };
      }),
    );
  },
});

export const updateMemberRole = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer"),
    ),
  },
  handler: async (ctx, args) => {
    const { workspaceId, userId: actorId } = await loadWorkspaceContext(
      ctx,
      args.workspaceId,
    );
    if (!roleAtLeast(await getRole(ctx, args.workspaceId, actorId), "admin")) {
      throw new Error("Only admins can change member roles");
    }
    const membership = await getMembership(ctx, args.workspaceId, args.userId);
    if (!membership) throw new Error("Member not found");
    if (membership.role === "owner") {
      throw new Error("The owner's role cannot be changed here");
    }
    await ctx.db.patch(membership._id, { role: args.role });
    await recordEvent(ctx, {
      workspaceId,
      actorId,
      entityType: "membership",
      entityId: membership._id,
      eventType: "member.role_changed",
      payload: { user_id: args.userId, new_role: args.role },
    });
  },
});

export const removeMember = mutation({
  args: { workspaceId: v.id("workspaces"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const { workspaceId, userId: actorId, role } = await loadWorkspaceContext(
      ctx,
      args.workspaceId,
    );
    const membership = await getMembership(ctx, args.workspaceId, args.userId);
    if (!membership) throw new Error("Member not found");
    if (membership.role === "owner") {
      throw new Error("Ownership must be transferred before the owner can be removed");
    }
    if (role !== "admin" && role !== "owner") {
      throw new Error("Only admins and owners can remove members");
    }
    if (role === "admin" && membership.role === "admin") {
      throw new Error("Admins cannot remove other admins");
    }

    await ctx.db.delete(membership._id);
    await recordEvent(ctx, {
      workspaceId,
      actorId,
      entityType: "membership",
      entityId: membership._id,
      eventType: "member.removed",
      payload: { user_id: args.userId },
    });
  },
});

async function getRole(
  ctx: Parameters<typeof getMembership>[0],
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
): Promise<"owner" | "admin" | "member" | "viewer"> {
  const m = await getMembership(ctx, workspaceId, userId);
  return m?.role ?? "viewer";
}

export const transferOwnership = mutation({
  args: { workspaceId: v.id("workspaces"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const { workspaceId, workspace } = await loadWorkspaceContext(
      ctx,
      args.workspaceId,
    );
    const user = await requireUser(ctx);
    if (workspace.ownerId !== user._id) {
      throw new Error("Only the current owner can transfer ownership");
    }
    const target = await getMembership(ctx, args.workspaceId, args.userId);
    if (!target) throw new Error("The new owner must be a workspace member");

    await ctx.db.patch(workspaceId, { ownerId: args.userId, updatedAt: Date.now() });
    await ctx.db.patch(target._id, { role: "owner" });

    const oldOwnerMembership = await getMembership(ctx, args.workspaceId, user._id);
    if (oldOwnerMembership) {
      await ctx.db.patch(oldOwnerMembership._id, { role: "admin" });
    }
    await recordEvent(ctx, {
      workspaceId,
      actorId: user._id,
      entityType: "workspace",
      entityId: workspaceId,
      eventType: "workspace.ownership_transferred",
      payload: { new_owner: args.userId },
    });
  },
});

export const leaveWorkspace = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const { workspaceId, userId, membership } = await loadWorkspaceContext(
      ctx,
      args.workspaceId,
    );
    if (membership.role === "owner") {
      throw new Error("Transfer ownership before leaving the workspace");
    }
    await ctx.db.delete(membership._id);
    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "membership",
      entityId: membership._id,
      eventType: "member.left",
    });
  },
});

// ---------------------------------------------------------------------------
// Invitations — token is hashed; the raw token is only ever shown once
// ---------------------------------------------------------------------------

// SHA-256 via Web Crypto (available in the Convex runtime)
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Creates one invitation per recipient email.
 *
 * Duplicate-proof by design: for each email we skip (a) existing workspace
 * members, (b) emails already attached to a live pending or accepted
 * invitation in this workspace, and (c) invalid/duplicate addresses within
 * the batch itself. Each survivor gets its own row, its own one-time token,
 * and — via the client calling emails.sendInvitationEmail per row — its own
 * email with a personalized accept link.
 *
 * Returns per-email results so the UI can show exactly what happened.
 */
export const createInvitations = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    emails: v.array(v.string()),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer"),
    ),
  },
  handler: async (ctx, args) => {
    const { workspaceId, role } = await loadWorkspaceContext(
      ctx,
      args.workspaceId,
    );
    if (!roleAtLeast(role, "admin")) {
      throw new Error("Only admins can invite members");
    }
    const user = await requireUser(ctx);
    const workspaceForNotify = (await ctx.db.get(args.workspaceId))!;
    const now = Date.now();

    // Normalize + drop malformed entries and duplicates inside the batch
    const seen = new Set<string>();
    const invalid: string[] = [];
    const requested: string[] = [];
    for (const raw of args.emails) {
      const email = raw.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (raw.trim()) invalid.push(raw.trim());
        continue;
      }
      if (seen.has(email)) continue; // duplicate within this batch
      seen.add(email);
      requested.push(email);
    }

    // Live invitation index for this workspace: one open invite per email
    const liveInvites = new Set<string>();
    for (const inv of await ctx.db
      .query("invitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect()) {
      if (!inv.acceptedAt && inv.expiresAt > now) {
        liveInvites.add(inv.email);
      }
    }

    const results: Array<{
      email: string;
      status: "created" | "already_member" | "already_pending" | "invalid" | "error";
      invitationId?: Id<"invitations">;
      token?: string;
      error?: string;
    }> = [];

    for (const email of requested) {
      // Existing user already in this workspace?
      const existing = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .unique();
      if (existing) {
        const m = await getMembership(ctx, args.workspaceId, existing._id);
        if (m) {
          results.push({ email, status: "already_member" });
          continue;
        }
      }
      // Already has a live (pending/accepted-not-expired) invitation?
      if (liveInvites.has(email)) {
        results.push({ email, status: "already_pending" });
        continue;
      }

      const token = randomToken();
      const tokenHash = await sha256Hex(token);
      try {
        const invitationId = await ctx.db.insert("invitations", {
          workspaceId,
          email,
          role: args.role,
          tokenHash,
          expiresAt: now + 7 * 24 * 60 * 60 * 1000,
          invitedBy: user._id,
          createdAt: now,
        });
        liveInvites.add(email);
        await recordEvent(ctx, {
          workspaceId,
          actorId: user._id,
          entityType: "invitation",
          entityId: email,
          eventType: "member.invited",
          payload: { email, role: args.role },
        });

        // In-app fallback: if the invitee already has a Forge account, notify
        // them directly so they can accept without relying on email delivery.
        if (existing) {
          await createNotification(ctx, {
            workspaceId,
            actorId: user._id,
            recipientId: existing._id,
            type: "member.invited",
            title: `${user.name ?? "Someone"} invited you to join ${workspaceForNotify.name}`,
            body: `You were invited as ${args.role}. You can accept from your Forge home page.`,
          });
        }

        results.push({ email, status: "created", invitationId, token });
      } catch (err) {
        results.push({
          email,
          status: "error",
          error: err instanceof Error ? err.message : "Failed to create invitation",
        });
      }
    }

    return { results, invalid };
  },
});

/**
 * Generates a fresh one-time token for an existing pending invitation and
 * clears the previous email-delivery state. The client then triggers the same
 * emails.sendInvitationEmail action used when the invitation was created.
 */
export const resendInvitation = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role } = await loadWorkspaceContext(
      ctx,
      args.workspaceId,
    );
    if (!roleAtLeast(role, "admin")) {
      throw new Error("Only admins can resend invitations");
    }
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation || invitation.workspaceId !== workspaceId) {
      throw new Error("Invitation not found");
    }
    if (invitation.acceptedAt) {
      throw new Error("This invitation has already been accepted");
    }
    // A new token revokes any previously shared link, and the fresh expiry
    // window makes resending work for expired invitations too.
    const token = randomToken();
    const tokenHash = await sha256Hex(token);
    await ctx.db.patch(invitation._id, {
      tokenHash,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      emailSentAt: undefined,
      emailError: undefined,
    });
    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "invitation",
      entityId: args.invitationId,
      eventType: "member.invitation_resent",
      payload: { email: invitation.email, role: invitation.role },
    });

    return { token };
  },
});

export const listInvitations = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const ctxData = await findWorkspaceContext(ctx, args.workspaceId);
    if (!ctxData || !roleAtLeast(ctxData.role, "admin")) return [];
    const rows = await ctx.db
      .query("invitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((i) => ({
        _id: i._id,
        email: i.email,
        role: i.role,
        expiresAt: i.expiresAt,
        acceptedAt: i.acceptedAt,
        createdAt: i.createdAt,
        emailSentAt: i.emailSentAt,
        emailError: i.emailError,
        status: i.acceptedAt ? "accepted" : i.expiresAt < Date.now() ? "expired" : "pending",
      }));
  },
});

export const revokeInvitation = mutation({
  args: { workspaceId: v.id("workspaces"), invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const { workspaceId, role } = await loadWorkspaceContext(ctx, args.workspaceId);
    if (!roleAtLeast(role, "admin")) throw new Error("Only admins can revoke invitations");
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation || invitation.workspaceId !== workspaceId) {
      throw new Error("Invitation not found");
    }
    await ctx.db.delete(args.invitationId);
  },
});

/** Public lookup of an invitation by its raw token (no auth — used by the accept page). */
export const getInvitationByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const tokenHash = await sha256Hex(args.token);
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (!invitation) return null;
    const workspace = await ctx.db.get(invitation.workspaceId);
    return {
      email: invitation.email,
      role: invitation.role,
      workspaceName: workspace?.name ?? "Unknown workspace",
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
    };
  },
});

/**
 * Shared acceptance path used by both the public token link (/invite) and the
 * home-page banner for existing users: create the membership, mark the
 * invitation used, and notify the workspace owner.
 */
async function joinFromInvitation(
  ctx: MutationCtx,
  invitation: Doc<"invitations">,
  user: Doc<"users">,
): Promise<{ workspaceId: Id<"workspaces"> }> {
  const existing = await getMembership(ctx, invitation.workspaceId, user._id);
  if (existing) {
    await ctx.db.patch(invitation._id, { acceptedAt: Date.now() });
    return { workspaceId: invitation.workspaceId };
  }

  await ctx.db.insert("memberships", {
    workspaceId: invitation.workspaceId,
    userId: user._id,
    role: invitation.role,
    joinedAt: Date.now(),
  });
  await ctx.db.patch(invitation._id, { acceptedAt: Date.now() });

  const workspace = await ctx.db.get(invitation.workspaceId);
  await createNotification(ctx, {
    workspaceId: invitation.workspaceId,
    recipientId: workspace!.ownerId,
    actorId: user._id,
    type: "member.joined",
    title: `${user.name ?? user.email ?? "Someone"} joined ${workspace?.name ?? "your workspace"}`,
  });
  await recordEvent(ctx, {
    workspaceId: invitation.workspaceId,
    actorId: user._id,
    entityType: "membership",
    entityId: user._id,
    eventType: "member.joined",
  });

  return { workspaceId: invitation.workspaceId };
}

/** Accepts an invitation via its one-time token (public /invite page). */
export const acceptInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const tokenHash = await sha256Hex(args.token);
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (!invitation) throw new Error("This invitation is invalid");
    if (invitation.acceptedAt) throw new Error("This invitation has already been used");
    if (invitation.expiresAt < Date.now()) throw new Error("This invitation has expired");

    return await joinFromInvitation(ctx, invitation, user);
  },
});

/**
 * Pending invitations addressed to the signed-in user's email. Powers the
 * "you've been invited" banner on the Forge home page so existing users can
 * accept without needing the email link.
 */
export const getMyInvitations = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const email = user.email?.trim().toLowerCase();
    if (!email) return [];

    const now = Date.now();
    const rows = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    const pending = rows.filter((i) => !i.acceptedAt && i.expiresAt > now);
    const visible = await Promise.all(
      pending.map(async (i) => ({
        invitation: i,
        alreadyMember: (await getMembership(ctx, i.workspaceId, user._id)) !== null,
      })),
    );

    return Promise.all(
      visible
        .filter(({ alreadyMember }) => !alreadyMember)
        .map(async ({ invitation }) => {
          const [workspace, inviter] = await Promise.all([
            ctx.db.get(invitation.workspaceId),
            ctx.db.get(invitation.invitedBy),
          ]);
          return {
            invitationId: invitation._id,
            workspaceId: invitation.workspaceId,
            workspaceName: workspace?.name ?? "a workspace",
            role: invitation.role,
            inviterName: inviter?.name ?? inviter?.email ?? "A teammate",
            expiresAt: invitation.expiresAt,
          };
        }),
    );
  },
});

/**
 * Accepts a pending invitation by id. Only allowed when the signed-in user's
 * email matches the invitation — this is the home-page banner path for users
 * who already have a Forge account, so no token is required.
 */
export const acceptMyInvitation = mutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const email = user.email?.trim().toLowerCase();

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("This invitation is no longer available");
    if (invitation.acceptedAt) throw new Error("This invitation has already been used");
    if (invitation.expiresAt < Date.now()) throw new Error("This invitation has expired");
    if (!email || email !== invitation.email) {
      throw new Error(
        "You are signed in with a different email than the one this invitation was sent to",
      );
    }

    return await joinFromInvitation(ctx, invitation, user);
  },
});
