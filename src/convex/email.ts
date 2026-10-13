import { ConvexError, v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  assignedEmailTemplate,
  commentEmailTemplate,
  invitationEmailTemplate,
  mentionedEmailTemplate,
  statusChangedEmailTemplate,
  testEmailTemplate,
  welcomeEmailTemplate,
} from "./email/templates";
import type { Doc, Id } from "./_generated/dataModel";

const ONE_HOUR_MS = 60 * 60 * 1000;
const MAX_SENDS_PER_HOUR = 20;

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const [local, domain] = parts;
  return `${local[0]}***@${domain}`;
}

export function resolveProvider(): "brevo" | "resend" | "log" {
  const configured = (process.env.EMAIL_PROVIDER || "").toLowerCase().trim();
  if (configured === "brevo") return "brevo";
  if (configured === "resend") return "resend";
  if (configured === "log") return "log";
  return "log";
}

export async function sendEmailDirect({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; provider: string; fallback?: boolean; reason?: string }> {
  const configured = (process.env.EMAIL_PROVIDER || "").toLowerCase().trim();
  if (!configured) {
    console.error(
      "[email] Missing EMAIL_PROVIDER environment variable in Convex deployment. Set EMAIL_PROVIDER to 'resend', 'brevo', or 'log'."
    );
    throw new ConvexError("Email isn't set up yet");
  }

  if (configured === "brevo") {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error(
        "[email:brevo] Missing BREVO_API_KEY environment variable in Convex deployment."
      );
      throw new ConvexError("Email isn't set up yet");
    }

    const rawFrom = process.env.EMAIL_FROM || "no-reply@forge.internal";
    const fromMatch = rawFrom.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const senderEmail = fromMatch ? fromMatch[1] : rawFrom;

    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Forge", email: senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });

      if (!response.ok) {
        console.warn(`[email:brevo] Delivery failed with HTTP ${response.status}`);
        return { ok: false, provider: "brevo", reason: `Brevo rejected request (HTTP ${response.status})` };
      }
      return { ok: true, provider: "brevo" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "network error";
      console.warn(`[email:brevo] Network error during send: ${msg}`);
      return { ok: false, provider: "brevo", reason: "Network error connecting to email provider" };
    }
  }

  if (configured === "resend") {
    const apiKey = process.env.RESEND_API_KEY || process.env.AUTH_RESEND_KEY;
    if (!apiKey) {
      console.error(
        "[email:resend] Missing RESEND_API_KEY (or AUTH_RESEND_KEY) environment variable in Convex deployment."
      );
      throw new ConvexError("Email isn't set up yet");
    }

    const from = process.env.EMAIL_FROM || "Forge <onboarding@resend.dev>";

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        let errDetail = `Resend rejected request (HTTP ${response.status})`;
        try {
          const errData = (await response.json()) as { message?: string };
          if (errData?.message) errDetail = errData.message;
        } catch {
          // Ignore JSON parse error
        }
        console.warn(`[email:resend] Delivery failed: ${errDetail}`);
        return { ok: false, provider: "resend", reason: errDetail };
      }
      return { ok: true, provider: "resend" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "network error";
      console.warn(`[email:resend] Network error during send: ${msg}`);
      return { ok: false, provider: "resend", reason: "Network error connecting to email provider" };
    }
  }

  if (configured === "log") {
    // DEV ONLY, remove before launch
    if (process.env.ALLOW_DEV_OTP_LOG === "true") {
      console.log(`[email:log] OTP Code: ${text} | To: ${maskEmail(to)}`);
    } else {
      console.log(`[email:log] To: ${maskEmail(to)} | Subject: "${subject}"`);
    }
    return { ok: true, provider: "log" };
  }

  console.error(
    `[email] Unrecognized EMAIL_PROVIDER '${configured}'. Set EMAIL_PROVIDER to 'resend', 'brevo', or 'log'.`
  );
  throw new ConvexError("Email isn't set up yet");
}

// ---------------------------------------------------------------------------
// Rate Limiting helper
// ---------------------------------------------------------------------------

export const checkAndIncrementRateLimit = internalMutation({
  args: { recipient: v.string() },
  handler: async (ctx, args) => {
    const recipient = args.recipient.trim().toLowerCase();
    const now = Date.now();

    const existing = await ctx.db
      .query("emailRateLimits")
      .withIndex("by_recipient", (q) => q.eq("recipient", recipient))
      .unique();

    if (!existing) {
      await ctx.db.insert("emailRateLimits", {
        recipient,
        windowStart: now,
        count: 1,
      });
      return true;
    }

    if (now - existing.windowStart < ONE_HOUR_MS) {
      if (existing.count >= MAX_SENDS_PER_HOUR) {
        return false;
      }
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
      return true;
    }

    // Reset window
    await ctx.db.patch(existing._id, { windowStart: now, count: 1 });
    return true;
  },
});

// ---------------------------------------------------------------------------
// Core sendEmail internal action
// ---------------------------------------------------------------------------

export const sendEmail = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.to || typeof args.to !== "string") {
      return { ok: false, reason: "No recipient address provided" };
    }
    const to = args.to.trim().toLowerCase();

    // HARD RULE: Never send to @demo.invalid
    if (to.endsWith("@demo.invalid")) {
      return { ok: false, reason: "Skipped: demo address (@demo.invalid)" };
    }

    // Rate limit check: cap sends per recipient (20 per hour)
    const allowed = await ctx.runMutation(internal.email.checkAndIncrementRateLimit, {
      recipient: to,
    });
    if (!allowed) {
      console.warn(`[email] Rate limit of ${MAX_SENDS_PER_HOUR}/hr reached for ${maskEmail(to)}`);
      return { ok: false, reason: "Rate limit reached (20 emails per hour)" };
    }

    return await sendEmailDirect({
      to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
  },
});

// ---------------------------------------------------------------------------
// Recipient and Notification Queries
// ---------------------------------------------------------------------------

export const getRecipientForNotification = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAnonymous: user.isAnonymous,
      emailMentions: user.emailMentions !== false,
      emailAssigned: user.emailAssigned !== false,
      emailComments: user.emailComments !== false,
      emailStatus: user.emailStatus !== false,
      emailInvites: user.emailInvites !== false,
    };
  },
});

export const getNotificationEmailContext = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    actorId: v.optional(v.id("users")),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    const actor = args.actorId ? await ctx.db.get(args.actorId) : null;

    let issueKey: string | undefined;
    let issueTitle: string | undefined;

    if (args.resourceType === "issue" && args.resourceId) {
      try {
        const issue = await ctx.db.get(args.resourceId as Id<"issues">);
        if (issue) {
          const project = await ctx.db.get(issue.projectId);
          if (project) {
            issueKey = `${project.key}-${issue.number}`;
          }
          issueTitle = issue.title;
        }
      } catch {
        // resourceId might not be an issue ID
      }
    }

    return {
      workspaceName: workspace?.name ?? "Forge",
      actorName: actor?.name || actor?.email || "A teammate",
      issueKey,
      issueTitle,
    };
  },
});

// ---------------------------------------------------------------------------
// Dispatch Notification Email
// ---------------------------------------------------------------------------

export const sendNotificationEmail = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    recipientId: v.id("users"),
    actorId: v.optional(v.id("users")),
    type: v.string(),
    title: v.string(),
    body: v.optional(v.string()),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Never send to the actor who caused the event
    if (args.actorId && args.recipientId === args.actorId) return;

    // 2. Load recipient and preferences
    const recipient = await ctx.runQuery(internal.email.getRecipientForNotification, {
      userId: args.recipientId,
    });
    if (!recipient) return;

    // HARD RULES: Never send to anonymous users or users without email or @demo.invalid
    if (recipient.isAnonymous || !recipient.email) return;
    const email = recipient.email.trim().toLowerCase();
    if (email.endsWith("@demo.invalid")) return;

    // Respect per-user notification preferences
    if (args.type === "issue.assigned" && !recipient.emailAssigned) return;
    if (args.type === "comment.mentioned" && !recipient.emailMentions) return;
    if (args.type === "comment.created" && !recipient.emailComments) return;
    if (args.type === "issue.status_changed" && !recipient.emailStatus) return;
    if (args.type === "member.invited" && !recipient.emailInvites) return;

    // 3. Resolve context
    const context = await ctx.runQuery(internal.email.getNotificationEmailContext, {
      workspaceId: args.workspaceId,
      actorId: args.actorId,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
    });

    const siteUrl = process.env.SITE_URL || process.env.CONVEX_SITE_URL || "";

    let template: { subject: string; html: string; text: string } | null = null;

    if (args.type === "issue.assigned") {
      template = assignedEmailTemplate({
        issueKey: context?.issueKey || "ISSUE",
        issueTitle: context?.issueTitle || args.body || args.title,
        assignerName: context?.actorName || "A teammate",
        issueId: args.resourceId || "",
        siteUrl,
      });
    } else if (args.type === "comment.mentioned") {
      template = mentionedEmailTemplate({
        authorName: context?.actorName || "A teammate",
        commentBody: args.body || "",
        issueKey: context?.issueKey,
        issueTitle: context?.issueTitle,
        issueId: args.resourceId || "",
        siteUrl,
      });
    } else if (args.type === "comment.created") {
      template = commentEmailTemplate({
        authorName: context?.actorName || "A teammate",
        commentBody: args.body || "",
        issueKey: context?.issueKey || "ISSUE",
        issueTitle: context?.issueTitle || args.title,
        issueId: args.resourceId || "",
        siteUrl,
      });
    } else if (args.type === "issue.status_changed") {
      // Body typically has new status or issue title
      template = statusChangedEmailTemplate({
        actorName: context?.actorName || "A teammate",
        issueKey: context?.issueKey || "ISSUE",
        issueTitle: context?.issueTitle || "",
        toStatus: args.body || "new status",
        issueId: args.resourceId || "",
        siteUrl,
      });
    }

    if (!template) return;

    await ctx.runAction(internal.email.sendEmail, {
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },
});

// ---------------------------------------------------------------------------
// Welcome Email Action
// ---------------------------------------------------------------------------

export const sendWelcomeEmail = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.email.getRecipientForNotification, {
      userId: args.userId,
    });
    if (!user || user.isAnonymous || !user.email) return;
    if (user.email.endsWith("@demo.invalid")) return;

    const siteUrl = process.env.SITE_URL || process.env.CONVEX_SITE_URL || "";
    const template = welcomeEmailTemplate({
      name: user.name || "there",
      siteUrl,
    });

    await ctx.runAction(internal.email.sendEmail, {
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },
});

export const triggerWelcomeEmailIfEligible = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.isAnonymous || !user.email) return;
    if (user.email.endsWith("@demo.invalid")) return;
    if (user.welcomeEmailSent) return;

    await ctx.db.patch(args.userId, { welcomeEmailSent: true });
    ctx.scheduler.runAfter(0, internal.email.sendWelcomeEmail, {
      userId: args.userId,
    });
  },
});

// ---------------------------------------------------------------------------
// Invitation Email Action
// ---------------------------------------------------------------------------

export const getInvitationForEmail = internalQuery({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const inv = await ctx.db.get(args.invitationId);
    if (!inv) return null;
    const [workspace, inviter] = await Promise.all([
      ctx.db.get(inv.workspaceId),
      ctx.db.get(inv.invitedBy),
    ]);
    return {
      _id: inv._id,
      email: inv.email,
      role: inv.role,
      workspaceName: workspace?.name ?? "Forge",
      inviterName: inviter?.name || inviter?.email || "A teammate",
    };
  },
});

export const updateInvitationEmailStatus = internalMutation({
  args: {
    invitationId: v.id("invitations"),
    sentAt: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.sentAt !== undefined) patch.emailSentAt = args.sentAt;
    if (args.error !== undefined) patch.emailError = args.error;
    else patch.emailError = undefined;
    await ctx.db.patch(args.invitationId, patch);
  },
});

export const sendInvitationEmail = internalAction({
  args: {
    invitationId: v.id("invitations"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const info = await ctx.runQuery(internal.email.getInvitationForEmail, {
      invitationId: args.invitationId,
    });
    if (!info || !info.email) return;

    const email = info.email.trim().toLowerCase();
    if (email.endsWith("@demo.invalid")) return;

    const siteUrl = process.env.SITE_URL || process.env.CONVEX_SITE_URL || "";
    const template = invitationEmailTemplate({
      inviterName: info.inviterName,
      workspaceName: info.workspaceName,
      role: info.role,
      token: args.token,
      siteUrl,
    });

    const res = await ctx.runAction(internal.email.sendEmail, {
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (res.ok) {
      await ctx.runMutation(internal.email.updateInvitationEmailStatus, {
        invitationId: args.invitationId,
        sentAt: Date.now(),
      });
    } else {
      await ctx.runMutation(internal.email.updateInvitationEmailStatus, {
        invitationId: args.invitationId,
        error: res.reason || "Failed to send email",
      });
    }
  },
});

// ---------------------------------------------------------------------------
// Test Email Action (called from Notification Settings UI)
// ---------------------------------------------------------------------------

export const sendTestEmail = action({
  args: {},
  handler: async (
    ctx,
  ): Promise<{ ok: boolean; message: string; provider: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in to send a test email.");
    }
    const user = await ctx.runQuery(internal.email.getRecipientForNotification, {
      userId,
    });
    if (!user) {
      throw new Error("User record not found.");
    }
    if (user.isAnonymous || !user.email) {
      throw new Error("Test emails can only be sent to real accounts with an email address.");
    }
    if (user.email.endsWith("@demo.invalid")) {
      throw new Error("Test emails cannot be sent to demo addresses (@demo.invalid).");
    }

    const provider = resolveProvider();
    const template = testEmailTemplate({
      name: user.name || user.email.split("@")[0] || "User",
      provider,
    });

    const result = await ctx.runAction(internal.email.sendEmail, {
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (!result.ok) {
      return {
        ok: false,
        message: result.reason || "Delivery could not be completed.",
        provider,
      };
    }

    return {
      ok: true,
      message:
        provider === "log"
          ? `Test email logged successfully (Provider: log — emails are printed to console when no key is set).`
          : `Test email sent to ${user.email} via ${provider}.`,
      provider,
    };
  },
});

// ---------------------------------------------------------------------------
// Email Status Query (for UI to show active provider clearly)
// ---------------------------------------------------------------------------

export const getEmailConfig = query({
  args: {},
  handler: async () => {
    const provider = resolveProvider();
    return {
      provider,
      hasBrevoKey: Boolean(process.env.BREVO_API_KEY),
      hasResendKey: Boolean(process.env.RESEND_API_KEY || process.env.AUTH_RESEND_KEY),
      senderEmail: process.env.EMAIL_FROM || "Not configured",
      isConfigured: provider !== "log",
    };
  },
});
