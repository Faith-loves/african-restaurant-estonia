import AdminOrders from "@/components/admin/AdminOrders";
import AdminGuard from "@/components/admin/AdminGuard";
import type { AdminPermission } from "@/lib/admin/permissions";

const orderPermissions: AdminPermission[] = ["manageOrders", "manageCatering"];

export default function AdminOrdersPage() {
  return <AdminGuard permission={orderPermissions}><AdminOrders /></AdminGuard>;
}
