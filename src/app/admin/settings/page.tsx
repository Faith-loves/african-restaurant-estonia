import AdminSettings from "@/components/admin/AdminSettings";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminSettingsPage() {
  return <AdminGuard permission="manageSettings"><AdminSettings /></AdminGuard>;
}

