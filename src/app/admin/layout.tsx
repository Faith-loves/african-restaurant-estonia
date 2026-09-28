import AdminNotificationBell from "@/components/admin/AdminNotificationBell";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider><AdminNotificationBell />{children}</AdminAuthProvider>;
}
