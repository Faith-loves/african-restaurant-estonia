"use client";

import { Bell, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type UpdateOrder = { id: string; reference: string; status: string };

function label(status: string) {
  if (status === "cancelled" || status === "declined") return "Declined / Cancelled";
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CustomerOrderUpdates({ orders, identityKey }: { orders: UpdateOrder[]; identityKey: string }) {
  const [updates, setUpdates] = useState<UpdateOrder[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storageKey = `are-order-statuses:${identityKey}`;
        const previous = JSON.parse(window.localStorage.getItem(storageKey) || "{}") as Record<string, string>;
        const current = Object.fromEntries(orders.map((order) => [order.id, order.status]));
        const hasBaseline = Object.keys(previous).length > 0;
        setUpdates(hasBaseline ? orders.filter((order) => previous[order.id] && previous[order.id] !== order.status) : []);
        window.localStorage.setItem(storageKey, JSON.stringify(current));
      } catch {
        setUpdates([]);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [identityKey, orders]);

  function markRead() {
    try {
      window.localStorage.setItem(`are-order-statuses:${identityKey}`, JSON.stringify(Object.fromEntries(orders.map((order) => [order.id, order.status]))));
    } catch {
      // Local read state is optional and never controls order access.
    }
    setUpdates([]);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} aria-label={updates.length ? `${updates.length} unread order updates` : "Order updates"} aria-expanded={open} aria-controls="customer-order-updates" className="relative inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#321B29]/15 bg-white px-4 py-3 text-sm font-extrabold text-[#321B29] transition hover:border-[#D89A27]"><Bell size={17} aria-hidden="true" /> Updates{updates.length > 0 && <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#B9472E] px-1 text-[10px] font-extrabold text-white">{updates.length}</span>}</button>
      {open && <div id="customer-order-updates" role="dialog" aria-label="Order updates" className="absolute right-0 z-20 mt-3 w-[min(90vw,22rem)] overflow-hidden rounded-2xl border border-[#321B29]/10 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-[#321B29]/10 px-4 py-3"><p className="text-sm font-extrabold text-[#321B29]">Order updates</p><Check size={16} className="text-[#B9472E]" aria-hidden="true" /></div>{updates.length === 0 ? <p className="px-4 py-8 text-center text-sm font-semibold text-[#151313]/60">No new order updates.</p> : <div className="max-h-72 overflow-y-auto">{updates.map((order) => <Link key={order.id} href="/account" onClick={markRead} className="block border-b border-[#321B29]/10 px-4 py-3 transition hover:bg-[#FFF8EC]"><span className="block text-xs font-extrabold text-[#321B29]">Order {label(order.status)}</span><span className="mt-1 block break-words text-xs font-bold text-[#B9472E]">{order.reference}</span><span className="mt-1 block text-xs font-semibold leading-5 text-[#151313]/60">Your order status has been updated.</span></Link>)}</div>}<button type="button" onClick={markRead} className="flex min-h-11 w-full items-center justify-center gap-2 px-4 py-3 text-xs font-extrabold text-[#321B29] hover:bg-[#FFF8EC]">View account <ExternalLink size={14} aria-hidden="true" /></button></div>}
    </div>
  );
}
