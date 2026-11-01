import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminAnalyticsPage() {
  return <AdminGuard permission="viewAnalytics"><AdminAnalytics /></AdminGuard>;
}
