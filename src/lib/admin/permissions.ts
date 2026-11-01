export const ADMIN_PERMISSION_KEYS = [
  "manageMenu",
  "manageTodayMenu",
  "manageImages",
  "manageOrders",
  "manageCatering",
  "viewCustomers",
  "viewAnalytics",
  "manageSettings",
  "manageAdmins",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSION_KEYS)[number];

export type AdminRecord = {
  role?: string;
  active?: boolean;
  permissions?: Partial<Record<AdminPermission, boolean>>;
  name?: string;
  email?: string;
};

export function isActiveAdminRecord(admin?: AdminRecord | null) {
  return Boolean(admin?.active === true && (admin.role === "owner" || admin.role === "admin"));
}

export function isOwner(admin?: AdminRecord | null) {
  return isActiveAdminRecord(admin) && admin?.role === "owner";
}

export function hasAdminPermission(admin: AdminRecord | null | undefined, permission: AdminPermission) {
  if (!admin || !isActiveAdminRecord(admin)) return false;
  if (admin.role === "owner") return true;
  if (!admin.permissions) return true;
  return admin.permissions[permission] === true;
}

export function hasAnyAdminPermission(admin: AdminRecord | null | undefined, permissions: AdminPermission[]) {
  return permissions.some((permission) => hasAdminPermission(admin, permission));
}
