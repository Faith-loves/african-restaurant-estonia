"use client";

import { doc, getDoc } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/client";
import { type AdminPermission, type AdminRecord, hasAdminPermission, isActiveAdminRecord, isOwner } from "@/lib/admin/permissions";

const ADMIN_AUTH_TIMEOUT_MS = 8_000;

type AdminAuthValue = {
  user: ReturnType<typeof useAuth>["user"];
  admin: AdminRecord | null;
  loading: boolean;
  error: string;
  retry: () => void;
  authorized: boolean;
  owner: boolean;
  hasPermission: (permission: AdminPermission) => boolean;
};

const AdminAuthContext = createContext<AdminAuthValue | undefined>(undefined);

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error("ADMIN_AUTH_TIMEOUT")), timeoutMs);
    }),
  ]);
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [admin, setAdmin] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (authLoading) {
      return () => { cancelled = true; };
    }

    if (!user) {
      queueMicrotask(() => {
        if (cancelled) return;
        setAdmin(null);
        setError("");
        setLoading(false);
      });
      return () => { cancelled = true; };
    }

    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError("");
    });

    void withTimeout(getDoc(doc(db, "admins", user.uid)), ADMIN_AUTH_TIMEOUT_MS)
      .then((snapshot) => {
        if (cancelled) return;
        setAdmin(snapshot.exists() ? snapshot.data() as AdminRecord : null);
        setLoading(false);
      })
      .catch((authError: unknown) => {
        if (cancelled) return;
        setAdmin(null);
        setError(authError instanceof Error && authError.message === "ADMIN_AUTH_TIMEOUT"
          ? "Administrator access is taking too long to verify."
          : "Unable to verify administrator access right now.");
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [authLoading, retryCount, user]);

  const retry = useCallback(() => setRetryCount((current) => current + 1), []);
  const value = useMemo(() => ({
    user,
    admin,
    loading,
    error,
    retry,
    authorized: isActiveAdminRecord(admin),
    owner: isOwner(admin),
    hasPermission: (permission: AdminPermission) => hasAdminPermission(admin, permission),
  }), [admin, error, loading, retry, user]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return context;
}
