import "server-only";

import { optionalEnv } from "@/lib/env";

type SendEmailInput = {
  to: string;
  subject: string;
  heading: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function renderHtml({ heading, body, actionLabel, actionUrl }: SendEmailInput) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px;background:#0a0a0a;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;color:#ededed">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111111;border:1px solid #262626;border-radius:16px;padding:32px">
            <tr><td style="font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#8f8f8f;padding-bottom:24px">Zivo</td></tr>
            <tr><td style="font-size:20px;font-weight:600;padding-bottom:12px">${heading}</td></tr>
            <tr><td style="font-size:14px;line-height:22px;color:#a3a3a3;padding-bottom:28px">${body}</td></tr>
            <tr><td><a href="${actionUrl}" style="display:inline-block;background:#ededed;color:#0a0a0a;font-size:14px;font-weight:600;text-decoration:none;padding:11px 20px;border-radius:10px">${actionLabel}</a></td></tr>
            <tr><td style="font-size:12px;line-height:20px;color:#6f6f6f;padding-top:28px">If you did not request this, you can safely ignore this email.</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText({ heading, body, actionUrl }: SendEmailInput) {
  return `${heading}\n\n${body}\n\n${actionUrl}\n`;
}

export function isMailConfigured() {
  return Boolean(optionalEnv("RESEND_API_KEY"));
}

export async function sendEmail(input: SendEmailInput) {
  const apiKey = optionalEnv("RESEND_API_KEY");
  const from = optionalEnv("EMAIL_FROM") ?? "Zivo <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(
      `[mail] RESEND_API_KEY is not set — email to ${input.to} was not sent.\n[mail] ${input.subject}: ${input.actionUrl}`,
    );
    return;
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: renderHtml(input),
      text: renderText(input),
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to send email (${response.status}): ${await response.text()}`,
    );
  }
}
