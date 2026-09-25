"use client";

import { useCallback, useEffect, useState } from "react";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { ADMIN_PERMISSION_KEYS, type AdminPermission } from "@/lib/admin/permissions";

type User = { uid: string; name?: string; email?: string; active?: boolean; role?: string; permissions?: Partial<Record<AdminPermission, boolean>> };

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({ manageMenu: true, manageTodayMenu: true, manageImages: true, manageOrders: true, manageCatering: true, manageSettings: true });
  const [resetLink, setResetLink] = useState("");
  const [message, setMessage] = useState("");

  async function call(path: string, options?: RequestInit) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");
    const token = await getIdToken(user);
    const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options?.headers ?? {}) } });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error ?? "Request failed") as Error & { data?: typeof data };
      error.data = data;
      throw error;
    }
    return data;
  }

  const load = useCallback(async () => { try { setUsers(await call("/api/admin/admins")); } catch (error) { setMessage((error as Error).message); } }, []);
  useEffect(() => onAuthStateChanged(auth, (user) => { if (user) void load(); }), [load]);

  async function invite(event: React.FormEvent) {
    event.preventDefault(); setMessage(""); setResetLink("");
    try { const data = await call("/api/admin/admins", { method: "POST", body: JSON.stringify({ name, email, permissions }) }); setResetLink(data.passwordResetLink); setName(""); setEmail(""); setMessage("Administrator created and invitation email sent. A one-time reset link is also shown below."); await load(); } catch (error) { const apiError = error as Error & { data?: { passwordResetLink?: string } }; if (apiError.data?.passwordResetLink) setResetLink(apiError.data.passwordResetLink); setMessage(apiError.message); }
  }

  async function toggle(user: User) { try { await call(`/api/admin/admins/${user.uid}`, { method: "PATCH", body: JSON.stringify({ active: !user.active }) }); await load(); } catch (error) { setMessage((error as Error).message); } }

  return <main className="min-h-screen bg-[#F8F3EA] p-5 text-[#151313] sm:p-8"><div className="mx-auto max-w-4xl"><div className="flex flex-wrap items-start gap-4"><button type="button" onClick={() => router.push("/admin")} aria-label="Back to admin dashboard" className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#321B29]/15 bg-white text-[#321B29] transition hover:border-[#D89A27] hover:bg-[#FFF8EC]"><ArrowLeft size={18} /></button><div><h1 className="font-[var(--font-cormorant)] text-4xl font-bold text-[#321B29]">Admin Users</h1><p className="mt-2 text-sm text-[#151313]/60">Owner-only access management.</p></div></div><form onSubmit={invite} className="mt-6 grid gap-4 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2"><label className="text-sm font-semibold">Name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label><label className="text-sm font-semibold">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label><fieldset className="sm:col-span-2"><legend className="text-sm font-semibold">Permissions</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{ADMIN_PERMISSION_KEYS.filter((key) => key !== "manageAdmins").map((key) => <label key={key} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={permissions[key] === true} onChange={(event) => setPermissions((current) => ({ ...current, [key]: event.target.checked }))} />{key}</label>)}</div></fieldset><button type="submit" className="min-h-11 rounded-lg bg-[#321B29] px-4 py-3 font-bold text-white sm:col-span-2">Invite administrator</button></form>{message && <p className="mt-4 rounded-lg bg-white p-3 text-sm">{message}</p>}{resetLink && <div className="mt-4 rounded-lg border border-[#D89A27] bg-[#FFF8EC] p-3 text-sm"><p className="font-bold">Copy this password-reset link securely:</p><p className="mt-2 break-all">{resetLink}</p></div>}<div className="mt-6 grid gap-3">{users.map((user) => <div key={user.uid} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4"><div><p className="font-bold">{user.name || user.email}</p><p className="text-sm text-black/55">{user.email} · {user.role} · {user.active ? "Active" : "Inactive"}</p></div>{user.role !== "owner" && <button type="button" onClick={() => void toggle(user)} className="min-h-11 rounded-lg border px-4 py-2 text-sm font-bold">{user.active ? "Deactivate" : "Activate"}</button>}</div>)}</div></div></main>;
}
