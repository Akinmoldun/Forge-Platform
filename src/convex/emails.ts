import { v } from "convex/values";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// ---------------------------------------------------------------------------
// Email availability. Invitations are only emailed when a verified sender is
// configured: RESEND_API_KEY + EMAIL_FROM, with the EMAIL_FROM domain actually
// verified in Resend — enforced both in the readiness probe and again inside
// the send action itself. Otherwise invitations are still created and the app
// falls back to shareable in-app links; no provider call is ever attempted
// and no fallback sender address exists.
// ---------------------------------------------------------------------------

type EmailConfig = { ok: true; from: string } | { ok: false; reason: string; hint: string };

function resolveEmailConfig(): EmailConfig {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey) {
    return {
      ok: false,
      reason: "Email service is not configured (missing RESEND_API_KEY).",
      hint:
        "Add RESEND_API_KEY and EMAIL_FROM (e.g. \"Forge <no-reply@yourdomain.com>\") in the deployment settings to send emails automatically. Invitations still work via in-app links.",
    };
  }
  if (!from) {
    return {
      ok: false,
      reason: "No verified sender address configured (missing EMAIL_FROM).",
      hint:
        "Verify your domain at resend.com/domains, then set EMAIL_FROM (e.g. \"Forge <no-reply@yourdomain.com>\") in the deployment settings. Until then, invitations are created with in-app links.",
    };
  }
  return { ok: true, from };
}

/** Pulls the bare domain out of an EMAIL_FROM value like "Forge <no-reply@acme.com>". */
function senderDomain(from: string): string | null {
  const match = from.match(/@([a-z0-9.-]+)/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * True when the EMAIL_FROM domain is among Resend's verified domains. If the
 * domains API can't be parsed, we stay optimistic and let Resend's own error
 * handling catch misconfiguration (fail-open, never fail the invitation).
 */
async function senderDomainIsVerified(apiKey: string, from: string): Promise<boolean> {
  const domain = senderDomain(from);
  if (!domain) return false;
  try {
    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) return true; // can't verify → let the send attempt decide
    const parsed = (await response.json()) as {
      data?: Array<{ name?: string; status?: string }>;
    };
    if (!Array.isArray(parsed.data)) return true;
    return parsed.data.some(
      (d) => d.name?.toLowerCase() === domain && d.status === "verified",
    );
  } catch {
    return true; // network hiccup → let the send attempt decide
  }
}

/**
 * Cheap reactive flag for the UI: is email sending configured at the env-var
 * level? A missing EMAIL_FROM is a VALID fallback state, never an error — the
 * result always carries emailAvailable/useLinkFallback so the client can
 * proceed with in-app links. This must never throw.
 */
export const emailConfigStatus = query({
  args: {},
  handler: async () => {
    try {
      const config = resolveEmailConfig();
      return {
        configured: config.ok,
        emailAvailable: config.ok,
        useLinkFallback: !config.ok,
        reason: config.ok ? undefined : config.reason,
      };
    } catch (err) {
      console.error(
        "[emails] Failed to read email configuration:",
        err instanceof Error ? err.message : err,
      );
      return {
        configured: false,
        emailAvailable: false,
        useLinkFallback: true,
        reason: "Email configuration could not be read.",
      };
    }
  },
});

/**
 * Full readiness check: env vars present AND the EMAIL_FROM domain is verified
 * with Resend. The client runs this once per invite batch; if it isn't ready,
 * invitation emails are skipped entirely (no Resend calls) and the UI falls
 * back to in-app invitation links.
 */
export const getEmailDeliveryStatus = action({
  args: {},
  handler: async () => {
    // This probe must never be the reason the app fails: every path returns a
    // value, and any unexpected error degrades to "email unavailable — use the
    // in-app link fallback". No secrets are ever included in messages.
    try {
      const config = resolveEmailConfig();
      if (!config.ok) {
        return {
          ready: false as const,
          emailAvailable: false as const,
          useLinkFallback: true as const,
          reason: config.reason,
          hint: config.hint,
        };
      }
      const verified = await senderDomainIsVerified(
        process.env.RESEND_API_KEY as string,
        config.from,
      );
      if (!verified) {
        return {
          ready: false as const,
          emailAvailable: false as const,
          useLinkFallback: true as const,
          reason: "The sender domain in EMAIL_FROM is not verified with Resend yet.",
          hint:
            "Verify the domain at resend.com/domains (add the DNS records Resend shows), or change EMAIL_FROM to a domain that is verified. Invitations still work via in-app links.",
        };
      }
      return {
        ready: true as const,
        emailAvailable: true as const,
        useLinkFallback: false as const,
      };
    } catch (err) {
      console.error(
        "[emails] Delivery status probe failed:",
        err instanceof Error ? err.message : err,
      );
      return {
        ready: false as const,
        emailAvailable: false as const,
        useLinkFallback: true as const,
        reason: "Email availability could not be determined.",
        hint: "Invitations will be created with in-app links.",
      };
    }
  },
});

/**
 * Sends a workspace invitation email through Resend.
 *
 * Called directly from the Members page right after the invitation is created,
 * so delivery errors surface immediately as a toast instead of failing silently
 * inside a scheduled job. Only called when getEmailDeliveryStatus reported
 * ready; the env-var gate below is defense in depth.
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

    const config = resolveEmailConfig();
    if (!config.ok) {
      // Not an invitation failure: the invitation stays pending and the app
      // shows its shareable link instead. Never mark it failed here.
      console.error(`[emails] Skipping invitation email: ${config.reason}`);
      return {
        delivered: false as const,
        skipped: true as const,
        error: config.reason,
        hint: config.hint,
      };
    }

    // Hard gate: even with both env vars present, never call the email
    // provider's send endpoint unless the sender domain is actually verified.
    if (
      !(await senderDomainIsVerified(
        process.env.RESEND_API_KEY as string,
        config.from,
      ))
    ) {
      const reason = "No verified sending domain is configured in Resend yet.";
      console.error(`[emails] Skipping invitation email: ${reason}`);
      return {
        delivered: false as const,
        skipped: true as const,
        error: reason,
        hint:
          "Verify a domain at resend.com/domains and set EMAIL_FROM to enable automatic invitation emails. Invitations still work via in-app links.",
      };
    }

    const from = config.from;
    const siteUrl = process.env.CONVEX_SITE_URL ?? "";
    const inviteLink = `${siteUrl}/invite?token=${args.token}`;
    const linkWarning = siteUrl
      ? undefined
      : "CONVEX_SITE_URL is not set; the emailed link may not point at this app.";
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
                  New to Forge? Click the button above and create your free account with
                  this email address (${invitation.email}). Already have an account? Just
                  sign in — you can also accept the invite from your Forge home page.
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
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
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
      console.error(`[emails] Invitation email to ${invitation.email} failed: ${error}`);
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
      console.error(
        `[emails] Invitation email to ${invitation.email} failed: ${message}`,
      );
      await ctx.runMutation(internal.emails.markInvitationFailed, {
        invitationId: args.invitationId,
        error: message,
      });
      return { delivered: false as const, error: message, hint };
    }

    if (linkWarning) console.warn(`[emails] ${linkWarning}`);
    await ctx.runMutation(internal.emails.markInvitationSent, {
      invitationId: args.invitationId,
    });
    return { delivered: true as const, linkWarning };
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
