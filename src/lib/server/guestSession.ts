import { createHash, randomBytes } from "crypto";

import { GUEST_SESSION_COOKIE } from "@/lib/guestSessionConstants";

export { GUEST_SESSION_COOKIE };

export function createGuestToken() {
  return randomBytes(32).toString("base64url");
}

export function hashGuestToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getGuestTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${GUEST_SESSION_COOKIE}=`));
  return cookie ? decodeURIComponent(cookie.slice(GUEST_SESSION_COOKIE.length + 1)) : "";
}
