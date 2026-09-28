import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Sends a workspace invitation email through Resend.
 *
 * Called from `workspaces.createInvitation` via ctx.scheduler. If RESEND_API_KEY
 * is missing the job fails quietly in the background — the invite link remains
 * available in the Members page as a manual fallback, so the product still works
 * without the third-party service (per PROJECT_PLAN.md).
 */
export const sendInvitationEmail = action({
  args: {
    invitationId: v.id("invitations"),
    to: v.string(),
    workspaceName: v.string(),
    inviterName: v.string(),
    role: v.string(),
    inviteLink: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not configured — invitation email not sent",
      );
    }

    const from = process.env.EMAIL_FROM ?? "Forge <onboarding@resend.dev>";
    const subject = `You've been invited to join ${args.workspaceName} on Forge`;
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
                  Join ${args.workspaceName} on Forge
                </h1>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
                  ${args.inviterName} invited you as a <strong style="color:#111827;">${args.role}</strong>.
                  Forge is where ${args.workspaceName} manages projects, workflows, and engineering work.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px;">
                <a href="${args.inviteLink}"
                   style="display:block;background:#2563eb;color:#ffffff;text-decoration:none;text-align:center;padding:12px 16px;border-radius:9px;font-weight:600;font-size:14px;">
                  Accept invitation
                </a>
                <p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#6b7280;">
                  This link is single-use and expires in 7 days. If the button doesn't work, paste this URL into your browser:<br />
                  <a href="${args.inviteLink}" style="color:#2563eb;word-break:break-all;">${args.inviteLink}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 28px;border-top:1px solid #f3f4f6;margin-top:16px;">
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

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Resend request failed (${response.status}): ${body.slice(0, 300)}`,
      );
    }

    const result = (await response.json()) as { id?: string };

    await ctx.runMutation(internal.emails.markInvitationSent, {
      invitationId: args.invitationId,
    });

    return { emailId: result.id ?? null };
  },
});

export const markInvitationSent = internalMutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invitationId, { emailSentAt: Date.now() });
  },
});
