import type { Metadata } from "next";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider><AdminNotificationBell />{children}</AdminAuthProvider>;
}
