import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { type AdminPermission, type AdminRecord, hasAdminPermission, isActiveAdminRecord, isOwner } from "@/lib/admin/permissions";

export async function getAdminAuthorization(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const decodedToken = await adminAuth.verifyIdToken(authorization.slice("Bearer ".length));
  const adminSnapshot = await adminDb.collection("admins").doc(decodedToken.uid).get();
  const admin = (adminSnapshot.exists ? adminSnapshot.data() : null) as AdminRecord | null;
  if (!isActiveAdminRecord(admin)) throw new Error("FORBIDDEN");
  return { decodedToken, admin };
}

export async function requireAdmin(request: Request) { return getAdminAuthorization(request); }

export async function requireAdminPermission(request: Request, permission: AdminPermission) {
  const authorization = await getAdminAuthorization(request);
  if (!hasAdminPermission(authorization.admin, permission)) throw new Error("FORBIDDEN");
  return authorization;
}

export async function requireOwner(request: Request) {
  const authorization = await getAdminAuthorization(request);
  if (!isOwner(authorization.admin)) throw new Error("FORBIDDEN");
  return authorization;
}
