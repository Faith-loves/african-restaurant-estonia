"use client";

import { useRef, useState } from "react";
import { applyRequestedMenuUpdates } from "@/lib/firebase/menuPriceUpdate";

export default function ApplyMenuUpdates({ disabled }: { disabled: boolean }) {
  const busy = useRef(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function apply() {
    if (busy.current) return;
    busy.current = true;
    setApplying(true);
    setError("");
    setMessage("");
    try {
      const count = await applyRequestedMenuUpdates();
      setMessage(count ? `Updated ${count} menu items. The customer menu now uses these saved prices and extras.` : "These updates are already applied. Your later edits have been preserved.");
    } catch (failure) {
      console.error("Menu price update failed:", failure);
      setError("The updates could not be completed. Check your connection and menu permission, then retry.");
    } finally {
      busy.current = false;
      setApplying(false);
    }
  }

  return (
    <aside className="mb-6 rounded-2xl border border-[#D89A27]/40 bg-[#D89A27]/10 p-5">
      <p className="font-extrabold text-[#321B29]">Requested prices, drinks and protein extras</p>
      <p className="mt-2 text-sm leading-6 text-[#321B29]/75">Apply the requested price and availability changes to the saved menu used by customers and checkout. Photos and descriptions are preserved. Applying again will keep later manual edits.</p>
      <button type="button" disabled={disabled || applying} onClick={() => void apply()} className="mt-4 min-h-11 rounded-xl bg-[#321B29] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29] disabled:cursor-wait disabled:opacity-50">
        {applying ? "Applying menu updates…" : "Apply menu updates"}
      </button>
      {message && <p role="status" className="mt-3 text-sm font-bold text-[#321B29]">{message}</p>}
      {error && <p role="alert" className="mt-3 text-sm font-bold text-[#B9472E]">{error}</p>}
    </aside>
  );
}
