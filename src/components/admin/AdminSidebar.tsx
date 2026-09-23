"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, ChefHat, LayoutDashboard, Settings, ShoppingBag, UserRound, UtensilsCrossed, X } from "lucide-react";

import { useAdminAuthorization } from "@/components/admin/AdminGuard";

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission, owner } = useAdminAuthorization();

  const navigation = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, visible: true },
    { label: "Menu Management", href: "/admin/menu", icon: UtensilsCrossed, visible: hasPermission("manageMenu") },
    { label: "Today's Menu", href: "/admin/today", icon: ChefHat, visible: hasPermission("manageTodayMenu") },
    { label: "Orders & Requests", href: "/admin/orders", icon: ShoppingBag, visible: hasPermission("manageOrders") || hasPermission("manageCatering") },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, visible: hasPermission("viewAnalytics") },
    { label: "Settings", href: "/admin/settings", icon: Settings, visible: hasPermission("manageSettings") },
    { label: "Admin Users", href: "/admin/admins", icon: UserRound, visible: owner },
  ].filter((item) => item.visible);

  return (
    <>
      <button type="button" aria-label="Close admin navigation" onClick={onClose} className={`fixed inset-0 z-40 bg-[#151313]/55 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-white/10 bg-[#321B29] px-4 py-5 text-[#FFF8EC] shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2">
          <button type="button" onClick={() => { router.push("/admin"); onClose(); }} className="relative h-14 w-[150px] focus:outline-none focus:ring-2 focus:ring-[#D89A27]" aria-label="Open admin dashboard">
            <Image src="/images/logo/are-logo.png" alt="African Restaurant Estonia" fill sizes="150px" className="object-contain object-left brightness-0 invert" />
          </button>
          <button type="button" onClick={onClose} aria-label="Close admin navigation" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 hover:bg-white/10 lg:hidden"><X size={19} /></button>
        </div>

        <div className="mt-8 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40">Workspace</div>
        <nav className="mt-3 space-y-1" aria-label="Admin navigation">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return <button key={href} type="button" onClick={() => { router.push(href); onClose(); }} className={`group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#D89A27] ${active ? "bg-[#D89A27] text-[#321B29]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}><Icon size={18} className={active ? "text-[#321B29]" : "text-[#D89A27]"} /><span>{label}</span></button>;
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <p className="text-xs font-extrabold text-[#D89A27]">African Restaurant Estonia</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-white/45">Manage the live customer experience from one place.</p>
        </div>
      </aside>
    </>
  );
}
