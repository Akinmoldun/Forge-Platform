/**
 * Email templates for Forge:
 * Plain, light, mobile-friendly HTML + text version.
 * Forge logo as clean text, one styled button each.
 */

function baseLayout({
  title,
  contentHtml,
  buttonText,
  buttonUrl,
  subtext,
}: {
  title: string;
  contentHtml: string;
  buttonText: string;
  buttonUrl: string;
  subtext?: string;
}): string {
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#FBFBFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0D0D0D;-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FBFBFC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;background-color:#FFFFFF;border-radius:14px;border:1px solid rgba(0,0,0,0.08);box-shadow:0 1px 4px rgba(0,0,0,0.03);overflow:hidden;">
            <!-- Header with Text Logo -->
            <tr>
              <td style="padding:28px 32px 20px;border-bottom:1px solid rgba(0,0,0,0.05);">
                <div style="font-size:18px;font-weight:700;color:#0D0D0D;letter-spacing:-0.5px;">Forge</div>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding:28px 32px 20px;">
                <h1 style="margin:0 0 16px;font-size:19px;line-height:1.35;color:#0D0D0D;font-weight:600;letter-spacing:-0.01em;">
                  ${title}
                </h1>
                <div style="font-size:14px;line-height:1.6;color:#575657;">
                  ${contentHtml}
                </div>
              </td>
            </tr>
            <!-- Call to action button -->
            <tr>
              <td style="padding:4px 32px 28px;">
                <a href="${buttonUrl}" style="display:inline-block;background-color:#0D0D0D;color:#FFFFFF;text-decoration:none;padding:11px 22px;border-radius:24px;font-size:13px;font-weight:500;text-align:center;">
                  ${buttonText}
                </a>
                ${
                  subtext
                    ? `<p style="margin:16px 0 0;font-size:11px;line-height:1.5;color:#9A9A9F;">${subtext}</p>`
                    : ""
                }
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:16px 32px;background-color:#FBFBFC;border-top:1px solid rgba(0,0,0,0.05);text-align:center;">
                <p style="margin:0;font-size:11px;color:#9A9A9F;">
                  Forge — Engineering workflow platform
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** 1. Welcome Email */
export function welcomeEmailTemplate({
  name,
  siteUrl,
}: {
  name: string;
  siteUrl: string;
}) {
  const url = `${siteUrl || ""}/app`;
  const subject = "Welcome to Forge";
  const title = `Welcome to Forge, ${name}`;
  const contentHtml = `<p style="margin:0 0 12px;">Forge is the engineering workflow platform for high-velocity teams.</p>
<p style="margin:0;">Track issues, configure custom lifecycle workflows, and collaborate with your teammates in real time.</p>`;
  const text = `Welcome to Forge, ${name}!

Forge is the engineering workflow platform for high-velocity teams.
Track issues, configure custom lifecycle workflows, and collaborate with your teammates in real time.

Open workspaces: ${url}`;

  return {
    subject,
    html: baseLayout({
      title,
      contentHtml,
      buttonText: "Open workspaces",
      buttonUrl: url,
    }),
    text,
  };
}

/** 2. Invitation Email */
export function invitationEmailTemplate({
  inviterName,
  workspaceName,
  role,
  token,
  siteUrl,
}: {
  inviterName: string;
  workspaceName: string;
  role: string;
  token: string;
  siteUrl: string;
}) {
  const url = `${siteUrl || ""}/invite?token=${encodeURIComponent(token)}`;
  const subject = `${inviterName} invited you to ${workspaceName} on Forge`;
  const title = `You've been invited to ${workspaceName}`;
  const contentHtml = `<p style="margin:0 0 10px;"><strong>${inviterName}</strong> invited you to join <strong>${workspaceName}</strong> as a <strong>${role}</strong>.</p>
<p style="margin:0;">Accept the invitation to collaborate on projects, track issues, and view workflows.</p>`;
  const subtext =
    "This invitation link expires in 7 days. If you already have an account, sign in to accept.";
  const text = `${inviterName} invited you to ${workspaceName} as ${role} on Forge.

Accept the invitation here:
${url}

This link expires in 7 days.`;

  return {
    subject,
    html: baseLayout({
      title,
      contentHtml,
      buttonText: "Accept invitation",
      buttonUrl: url,
      subtext,
    }),
    text,
  };
}

/** 3. Assigned to you Email */
export function assignedEmailTemplate({
  issueKey,
  issueTitle,
  assignerName,
  issueId,
  siteUrl,
}: {
  issueKey: string;
  issueTitle: string;
  assignerName: string;
  issueId: string;
  siteUrl: string;
}) {
  const url = `${siteUrl || ""}/app/issues/${issueId}`;
  const subject = `[${issueKey}] Assigned to you: ${issueTitle}`;
  const title = `Issue assigned to you`;
  const contentHtml = `<p style="margin:0 0 8px;"><strong>${assignerName}</strong> assigned you to <strong>${issueKey}</strong>:</p>
<blockquote style="margin:0 0 12px;padding:10px 14px;background:#F1F1F3;border-radius:8px;font-size:13px;color:#0D0D0D;font-weight:500;">
  ${issueTitle}
</blockquote>`;
  const text = `${assignerName} assigned you to ${issueKey}: ${issueTitle}

Open issue: ${url}`;

  return {
    subject,
    html: baseLayout({
      title,
      contentHtml,
      buttonText: "Open issue",
      buttonUrl: url,
    }),
    text,
  };
}

/** 4. Mentioned you Email */
export function mentionedEmailTemplate({
  authorName,
  commentBody,
  issueKey,
  issueTitle,
  issueId,
  siteUrl,
}: {
  authorName: string;
  commentBody: string;
  issueKey?: string;
  issueTitle?: string;
  issueId: string;
  siteUrl: string;
}) {
  const url = `${siteUrl || ""}/app/issues/${issueId}`;
  const trimmedComment = commentBody.slice(0, 200) + (commentBody.length > 200 ? "…" : "");
  const subject = issueKey
    ? `[${issueKey}] ${authorName} mentioned you`
    : `${authorName} mentioned you on Forge`;
  const title = `${authorName} mentioned you`;
  const contentHtml = `<p style="margin:0 0 8px;"><strong>${authorName}</strong> mentioned you in a comment${issueKey ? ` on <strong>${issueKey}</strong> (${issueTitle ?? ""})` : ""}:</p>
<blockquote style="margin:0 0 12px;padding:12px 14px;background:#F1F1F3;border-left:3px solid #0D0D0D;border-radius:4px;font-size:13px;color:#0D0D0D;font-style:italic;">
  ${trimmedComment}
</blockquote>`;
  const text = `${authorName} mentioned you${issueKey ? ` on ${issueKey}` : ""}:
"${trimmedComment}"

Open comment: ${url}`;

  return {
    subject,
    html: baseLayout({
      title,
      contentHtml,
      buttonText: "Open comment",
      buttonUrl: url,
    }),
    text,
  };
}

/** 5. Comment on your issue Email */
export function commentEmailTemplate({
  authorName,
  commentBody,
  issueKey,
  issueTitle,
  issueId,
  siteUrl,
}: {
  authorName: string;
  commentBody: string;
  issueKey: string;
  issueTitle: string;
  issueId: string;
  siteUrl: string;
}) {
  const url = `${siteUrl || ""}/app/issues/${issueId}`;
  const trimmedComment = commentBody.slice(0, 200) + (commentBody.length > 200 ? "…" : "");
  const subject = `[${issueKey}] New comment from ${authorName}`;
  const title = `New comment on ${issueKey}`;
  const contentHtml = `<p style="margin:0 0 6px;"><strong>${authorName}</strong> commented on <strong>${issueKey}: ${issueTitle}</strong>:</p>
<blockquote style="margin:0 0 12px;padding:12px 14px;background:#F1F1F3;border-radius:8px;font-size:13px;color:#0D0D0D;">
  ${trimmedComment}
</blockquote>`;
  const text = `${authorName} commented on ${issueKey} (${issueTitle}):
"${trimmedComment}"

View comment: ${url}`;

  return {
    subject,
    html: baseLayout({
      title,
      contentHtml,
      buttonText: "View comment",
      buttonUrl: url,
    }),
    text,
  };
}

/** 6. Status changed Email */
export function statusChangedEmailTemplate({
  actorName,
  issueKey,
  issueTitle,
  toStatus,
  issueId,
  siteUrl,
}: {
  actorName: string;
  issueKey: string;
  issueTitle: string;
  toStatus: string;
  issueId: string;
  siteUrl: string;
}) {
  const url = `${siteUrl || ""}/app/issues/${issueId}`;
  const subject = `[${issueKey}] Status changed to ${toStatus}`;
  const title = `${issueKey} moved to ${toStatus}`;
  const contentHtml = `<p style="margin:0 0 10px;"><strong>${actorName}</strong> changed the status of <strong>${issueKey} (${issueTitle})</strong> to <strong>${toStatus}</strong>.</p>`;
  const text = `${actorName} changed the status of ${issueKey} (${issueTitle}) to "${toStatus}".

View issue: ${url}`;

  return {
    subject,
    html: baseLayout({
      title,
      contentHtml,
      buttonText: "View issue",
      buttonUrl: url,
    }),
    text,
  };
}

/** 7. Test Email */
export function testEmailTemplate({
  name,
  provider,
}: {
  name: string;
  provider: string;
}) {
  const subject = "Forge: Test email";
  const title = "Forge email test";
  const contentHtml = `<p style="margin:0 0 10px;">Hello <strong>${name}</strong>,</p>
<p style="margin:0 0 10px;">This is a test email sent from your Forge notification preferences.</p>
<p style="margin:0;">Active provider: <strong>${provider}</strong>. Email delivery is configured and working properly!</p>`;
  const text = `Hello ${name},

This is a test email sent from your Forge notification preferences.
Active provider: ${provider}. Email delivery is configured and working properly!`;

  return {
    subject,
    html: baseLayout({
      title,
      contentHtml,
      buttonText: "Return to Forge",
      buttonUrl: "https://forge.app",
    }),
    text,
  };
}
