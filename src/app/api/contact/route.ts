import { NextResponse } from "next/server";

import { sendRestaurantContactEmail } from "@/lib/email/contactEmails";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = text(body.name);
    const email = text(body.email).toLowerCase();
    const subject = text(body.subject) || "Website Enquiry";
    const message = text(body.message);

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject and message are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (name.length > 120 || email.length > 254 || subject.length > 160 || message.length > 5000) {
      return NextResponse.json(
        { error: "One or more fields are too long." },
        { status: 400 }
      );
    }

    const result = await sendRestaurantContactEmail({
      name,
      email,
      subject,
      message,
    });

    if (result.error) {
      console.error("Restaurant contact email error:", result.error);
      return NextResponse.json(
        { error: "Unable to send your message right now. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Unable to send your message right now. Please try again." },
      { status: 500 }
    );
  }
}
