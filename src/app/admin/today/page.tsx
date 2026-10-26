import AdminTodayMenu from "@/components/admin/AdminTodayMenu";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminTodayMenuPage() {
  return <AdminGuard permission="manageTodayMenu"><AdminTodayMenu /></AdminGuard>;
}

