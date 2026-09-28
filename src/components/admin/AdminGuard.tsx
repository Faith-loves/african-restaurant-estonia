"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGuestSession } from "@/context/GuestSessionContext";
import { type AdminPermission, type AdminRecord } from "@/lib/admin/permissions";
import { useAdminAuth } from "@/context/AdminAuthContext";

type AdminAuthorization = {
  admin: AdminRecord | null;
  hasPermission: (permission: AdminPermission) => boolean;
  owner: boolean;
};

const AdminAuthorizationContext = createContext<AdminAuthorization>({ admin: null, hasPermission: () => false, owner: false });

export function useAdminAuthorization() { return useContext(AdminAuthorizationContext); }

type AdminGuardProps = { children: React.ReactNode; permission?: AdminPermission | AdminPermission[]; ownerOnly?: boolean };

export default function AdminGuard({ children, permission, ownerOnly = false }: AdminGuardProps) {
  const router = useRouter();
  const { guestActive, ready: guestReady } = useGuestSession();
  const { user, admin, loading, error, retry, authorized, owner, hasPermission } = useAdminAuth();

  const allowed = Boolean(
    user &&
    authorized &&
    (!ownerOnly || owner) &&
    (Array.isArray(permission) ? permission.some(hasPermission) : permission ? hasPermission(permission) : true)
  );

  useEffect(() => {
    if (!guestReady || loading || error) return;
    if (guestActive) router.replace("/account");
    else if (!user) router.replace("/login");
  }, [error, guestActive, guestReady, loading, router, user]);

  const value = useMemo(() => ({ admin, owner, hasPermission }), [admin, hasPermission, owner]);
  if (loading || !guestReady) return <main className="p-6">Checking admin access…</main>;
  if (error) return <main className="mx-auto max-w-xl p-6 text-center"><h1 className="text-2xl font-semibold">Administrator access is unavailable</h1><p className="mt-2 text-gray-600">Firebase could not verify administrator access. You can retry without signing out.</p><button type="button" onClick={retry} className="mt-5 min-h-11 rounded bg-black px-5 py-3 text-white">Retry</button></main>;
  if (!allowed) return <main className="mx-auto max-w-xl p-6 text-center"><h1 className="text-2xl font-semibold">Access denied</h1><p className="mt-2 text-gray-600">Your account does not have permission to view this admin area.</p><button type="button" onClick={() => router.push("/admin")} className="mt-5 min-h-11 rounded bg-black px-5 py-3 text-white">Back to dashboard</button></main>;
  return <AdminAuthorizationContext.Provider value={value}>{children}</AdminAuthorizationContext.Provider>;
}
