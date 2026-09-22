"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/client";
import { useGuestSession } from "@/context/GuestSessionContext";
import { type AdminPermission, type AdminRecord, hasAdminPermission, isActiveAdminRecord, isOwner } from "@/lib/admin/permissions";

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
  const [admin, setAdmin] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const { guestActive, ready: guestReady } = useGuestSession();

  useEffect(() => {
    if (!guestReady) return;
    return onAuthStateChanged(auth, async (user) => {
    if (guestActive) {
      setAllowed(false);
      setLoading(false);
      router.replace("/account");
      return;
    }
    if (!user) { setAllowed(false); setLoading(false); router.replace("/login"); return; }
    try {
      const snapshot = await getDoc(doc(db, "admins", user.uid));
      const data = snapshot.exists() ? snapshot.data() as AdminRecord : null;
      const hasRequiredPermission = Array.isArray(permission)
        ? permission.some((item) => hasAdminPermission(data, item))
        : permission ? hasAdminPermission(data, permission) : true;
      setAdmin(data);
      setAllowed(isActiveAdminRecord(data) && (!ownerOnly || isOwner(data)) && hasRequiredPermission);
    } catch {
      setAdmin(null);
      setAllowed(false);
    } finally { setLoading(false); }
    });
  }, [guestActive, guestReady, ownerOnly, permission, router]);

  const value = useMemo(() => ({ admin, owner: isOwner(admin), hasPermission: (item: AdminPermission) => hasAdminPermission(admin, item) }), [admin]);
  if (loading) return <main className="p-6">Checking admin access…</main>;
  if (!allowed) return <main className="mx-auto max-w-xl p-6 text-center"><h1 className="text-2xl font-semibold">Access denied</h1><p className="mt-2 text-gray-600">Your account does not have permission to view this admin area.</p><button type="button" onClick={() => router.push("/admin")} className="mt-5 min-h-11 rounded bg-black px-5 py-3 text-white">Back to dashboard</button></main>;
  return <AdminAuthorizationContext.Provider value={value}>{children}</AdminAuthorizationContext.Provider>;
}
