import AdminNotificationBell from "@/components/admin/AdminNotificationBell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <><AdminNotificationBell />{children}</>;
}
