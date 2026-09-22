"use client";

import { Bell, CheckCircle2, Gift, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase/client";

type NotificationItem = {
  id: string;
  type: "order" | "catering" | "gift-box";
  resourceId: string;
  reference: string;
  requesterName: string | null;
  createdAt: string | null;
  read: boolean;
};

function notificationTitle(type: NotificationItem["type"]) {
  if (type === "order") return "New Order";
  if (type === "gift-box") return "New Gift Box Request";
  return "New Catering Request";
}

function notificationDescription(notification: NotificationItem) {
  if (notification.type === "order") return `New food order${notification.requesterName ? ` from ${notification.requesterName}` : ""}`;
  if (notification.type === "gift-box") return `New Food Gift Box request${notification.requesterName ? ` from ${notification.requesterName}` : ""}`;
  return `New catering request${notification.requesterName ? ` from ${notification.requesterName}` : ""}`;
}

function notificationIcon(type: NotificationItem["type"]) {
  if (type === "order") return ShoppingBag;
  if (type === "gift-box") return Gift;
  return UtensilsCrossed;
}

function relativeTime(value: string | null) {
  if (!value) return "Just now";
  const difference = Date.now() - new Date(value).getTime();
  if (difference < 60_000) return "Just now";
  if (difference < 3_600_000) return `${Math.floor(difference / 60_000)}m ago`;
  if (difference < 86_400_000) return `${Math.floor(difference / 3_600_000)}h ago`;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

async function loadNotifications(user: User) {
  const token = await user.getIdToken();
  const response = await fetch("/api/admin/notifications", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) return null;
  return (await response.json()) as { notifications: NotificationItem[]; unreadCount: number };
}

export default function AdminNotificationBell() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function refresh(nextUser: User) {
      try {
        const result = await loadNotifications(nextUser);
        if (active && result) {
          setAuthorized(true);
          setNotifications(result.notifications);
          setUnreadCount(result.unreadCount);
        }
      } catch {
        // Protected notification failures stay quiet in the admin chrome.
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      if (nextUser) void refresh(nextUser);
      else {
        setAuthorized(false);
        setNotifications([]);
        setUnreadCount(0);
      }
    });
    const timer = window.setInterval(() => {
      if (auth.currentUser) void refresh(auth.currentUser);
    }, 30_000);

    return () => {
      active = false;
      unsubscribe();
      window.clearInterval(timer);
    };
  }, []);

  async function openNotification(notification: NotificationItem) {
    if (user && !notification.read) {
      try {
        const token = await user.getIdToken();
        await fetch("/api/admin/notifications", { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ id: notification.id }) });
      } catch {
        // Navigation remains useful if marking read is temporarily unavailable.
      }
    }

    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item));
    setUnreadCount((current) => Math.max(0, current - (notification.read ? 0 : 1)));
    setOpen(false);
    router.push(`/admin/orders#${notification.type === "order" ? "orders" : notification.type === "gift-box" ? "gift-box" : "catering"}`);
  }

  if (!user || !authorized) return null;

  return (
    <div className="fixed right-4 top-20 z-50 sm:right-6">
      <button type="button" onClick={() => setOpen((current) => !current)} aria-label={unreadCount ? `${unreadCount} unread notifications` : "Notifications"} aria-expanded={open} aria-controls="admin-notification-panel" className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#321B29]/10 bg-white text-[#321B29] shadow-lg transition hover:border-[#D89A27]"><Bell size={19} />{unreadCount > 0 && <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#B9472E] px-1 text-[10px] font-extrabold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}</button>
      {open && <div id="admin-notification-panel" role="dialog" aria-label="Admin notifications" className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-[#321B29]/10 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-[#321B29]/10 px-4 py-3"><p className="text-sm font-extrabold text-[#321B29]">Notifications</p><CheckCircle2 size={16} className="text-[#B9472E]" /></div><div className="max-h-[min(65vh,460px)] overflow-y-auto">{notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm font-semibold text-[#151313]/55">No new notifications</p> : notifications.map((notification) => { const Icon = notificationIcon(notification.type); return <button key={notification.id} type="button" onClick={() => void openNotification(notification)} className={`flex w-full items-start gap-3 border-b border-[#321B29]/10 px-4 py-3 text-left transition hover:bg-[#FFF8EC] ${notification.read ? "opacity-60" : "bg-[#FFF8EC]/60"}`}><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#321B29] text-[#D89A27]"><Icon size={15} /></span><span className="min-w-0"><span className="block text-xs font-extrabold text-[#321B29]">{notificationTitle(notification.type)}</span><span className="mt-0.5 block break-words text-xs font-bold text-[#321B29]">{notification.reference}</span><span className="mt-1 block text-xs font-semibold leading-5 text-[#151313]/60">{notificationDescription(notification)}</span><span className="mt-1 block text-[10px] font-bold text-[#151313]/45">{relativeTime(notification.createdAt)}</span></span></button>; })}</div></div>}
    </div>
  );
}
