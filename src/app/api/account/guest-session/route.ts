import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { createGuestToken, getGuestTokenFromRequest, GUEST_SESSION_COOKIE, hashGuestToken } from "@/lib/server/guestSession";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 90,
};

export async function POST(request: Request) {
  const existingToken = getGuestTokenFromRequest(request);
  const existingId = existingToken ? hashGuestToken(existingToken) : "";
  if (existingId) {
    const existing = await adminDb.collection("guestSessions").doc(existingId).get();
    if (existing.exists) {
      await existing.ref.update({ lastSeenAt: FieldValue.serverTimestamp() });
      const response = NextResponse.json({ active: true });
      response.cookies.set(GUEST_SESSION_COOKIE, existingToken, cookieOptions);
      return response;
    }
  }

  const token = createGuestToken();
  const sessionId = hashGuestToken(token);
  await adminDb.collection("guestSessions").doc(sessionId).create({
    createdAt: FieldValue.serverTimestamp(),
    lastSeenAt: FieldValue.serverTimestamp(),
  });

  const response = NextResponse.json({ active: true });
  response.cookies.set(GUEST_SESSION_COOKIE, token, cookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ active: false });
  response.cookies.set(GUEST_SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
