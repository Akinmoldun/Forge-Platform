import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Sends a workspace invitation email through Resend.
 *
 * Called directly from the Members page right after the invitation is created,
 * so delivery errors surface immediately as a toast instead of failing silently
 * inside a scheduled job.
 *
 * Only the invitationId and single-use token come from the client; everything
 * else (recipient, workspace, inviter) is loaded from the database so callers
 * cannot spoof the email content.
 */
export const sendInvitationEmail = action({
  args: {
    invitationId: v.id("invitations"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const invitation = await ctx.runQuery(internal.emails.getInvitation, {
      invitationId: args.invitationId,
    });
    if (!invitation) {
      return { delivered: false as const, error: "Invitation not found" };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      const error = "Email service is not configured (missing RESEND_API_KEY).";
      await ctx.runMutation(internal.emails.markInvitationFailed, {
        invitationId: args.invitationId,
        error,
      });
      return { delivered: false as const, error };
    }

    const from = process.env.EMAIL_FROM ?? "Forge <onboarding@resend.dev>";
    const inviteLink = `${process.env.CONVEX_SITE_URL ?? ""}/invite?token=${args.token}`;
    const subject = `You've been invited to join ${invitation.workspaceName} on Forge`;
    const html = `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:32px 32px 8px;">
                <div style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;border-radius:9px;background:#2563eb;color:#ffffff;font-weight:700;font-size:18px;">F</div>
                <h1 style="margin:20px 0 8px;font-size:20px;line-height:1.3;color:#111827;">
                  Join ${invitation.workspaceName} on Forge
                </h1>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
                  ${invitation.inviterName} invited you as a <strong style="color:#111827;">${invitation.role}</strong>.
                  Forge is where ${invitation.workspaceName} manages projects, workflows, and engineering work.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px;">
                <a href="${inviteLink}"
                   style="display:block;background:#2563eb;color:#ffffff;text-decoration:none;text-align:center;padding:12px 16px;border-radius:9px;font-weight:600;font-size:14px;">
                  Accept invitation
                </a>
                <p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#6b7280;">
                  This link is single-use and expires in 7 days. If the button doesn't work, paste this URL into your browser:<br />
                  <a href="${inviteLink}" style="color:#2563eb;word-break:break-all;">${inviteLink}</a>
                </p>
                <p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:#6b7280;">
                  Already have a Forge account with this email? You can also accept the invite from your Forge home page.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 28px;border-top:1px solid #f3f4f6;">
                <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;">
                  Didn't expect this? You can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    let response: Response;
    try {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [invitation.email],
          subject,
          html,
        }),
      });
    } catch (err) {
      const error = `Could not reach the email service: ${err instanceof Error ? err.message : "network error"}`;
      await ctx.runMutation(internal.emails.markInvitationFailed, {
        invitationId: args.invitationId,
        error,
      });
      return { delivered: false as const, error };
    }

    if (!response.ok) {
      const raw = await response.text();
      let message = `Email provider rejected the request (HTTP ${response.status}).`;
      let hint: string | undefined;
      try {
        const parsed = JSON.parse(raw) as { message?: string };
        if (parsed.message) message = parsed.message;
      } catch {
        // keep the generic message
      }
      if (
        response.status === 403 &&
        message.toLowerCase().includes("verify a domain")
      ) {
        hint =
          "Resend only delivers to the account owner's own email address until a sending domain is verified. Verify your domain at resend.com/domains and set EMAIL_FROM, test with your own address, or invite an existing Forge user — they can accept the invite directly from their Forge home page.";
      }
      await ctx.runMutation(internal.emails.markInvitationFailed, {
        invitationId: args.invitationId,
        error: message,
      });
      return { delivered: false as const, error: message, hint };
    }

    await ctx.runMutation(internal.emails.markInvitationSent, {
      invitationId: args.invitationId,
    });
    return { delivered: true as const };
  },
});

/** Loads trusted invitation data for the email action. */
export const getInvitation = internalQuery({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) return null;
    const [workspace, inviter] = await Promise.all([
      ctx.db.get(invitation.workspaceId),
      ctx.db.get(invitation.invitedBy),
    ]);
    return {
      email: invitation.email,
      role: invitation.role,
      workspaceName: workspace?.name ?? "a workspace",
      inviterName: inviter?.name ?? inviter?.email ?? "A teammate",
    };
  },
});

export const markInvitationSent = internalMutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invitationId, {
      emailSentAt: Date.now(),
      emailError: undefined,
    });
  },
});

export const markInvitationFailed = internalMutation({
  args: { invitationId: v.id("invitations"), error: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invitationId, { emailError: args.error });
  },
});
