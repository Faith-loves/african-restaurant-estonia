import AdminMenuManager from "@/components/admin/AdminMenuManager";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminMenuPage() {
  return <AdminGuard permission="manageMenu"><AdminMenuManager /></AdminGuard>;
}

