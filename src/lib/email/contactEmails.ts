import {
  EMAIL_FROM,
  resend,
  RESTAURANT_EMAIL,
} from "@/lib/email/resend";

type ContactEmailData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendRestaurantContactEmail(
  contact: ContactEmailData
) {
  return resend.emails.send({
    from: EMAIL_FROM,
    to: [RESTAURANT_EMAIL],
    replyTo: contact.email,
    subject: `New Contact Request - ${contact.subject}`,
    html: `
      <h1>New Contact Request</h1>
      <p><strong>Subject:</strong> ${escapeHtml(contact.subject)}</p>
      <h2>Customer details</h2>
      <p>
        <strong>Name:</strong> ${escapeHtml(contact.name)}<br />
        <strong>Email:</strong> ${escapeHtml(contact.email)}
      </p>
      <h2>Message</h2>
      <p>${escapeHtml(contact.message).replace(/\n/g, "<br />")}</p>
      <p>Sent from the African Restaurant Estonia contact form.</p>
    `,
  });
}
