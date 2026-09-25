import {
  EMAIL_FROM,
  resend,
  RESTAURANT_EMAIL,
} from "@/lib/email/resend";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendAdminInvitationEmail(input: {
  name: string;
  email: string;
  passwordResetLink: string;
}) {
  const result = await resend.emails.send({
    from: EMAIL_FROM,
    to: [input.email],
    replyTo: RESTAURANT_EMAIL,
    subject: "You have been invited as an administrator",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;line-height:1.6;color:#151313;">
        <h1 style="color:#321B29;">Admin invitation</h1>
        <p>Hello ${escapeHtml(input.name)},</p>
        <p>
          You have been invited to manage African Restaurant Estonia as an administrator.
        </p>
        <p>
          Use the button below to create your password and finish signing in.
        </p>
        <p>
          <a href="${escapeHtml(input.passwordResetLink)}" style="display:inline-block;background:#321B29;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700;">
            Set your administrator password
          </a>
        </p>
        <p style="font-size:13px;color:#696969;">
          If the button does not work, copy and paste this link into your browser:<br />
          ${escapeHtml(input.passwordResetLink)}
        </p>
        <p style="margin-top:30px;color:#696969;font-size:12px;">
          If you were not expecting this invitation, you can ignore this email.
        </p>
      </div>
    `,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
