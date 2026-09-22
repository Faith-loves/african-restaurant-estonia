"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartNavButton() {
  const {
    itemCount,
    openCart,
  } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Open cart"
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#321B29]/15 bg-[#FFF8EC] text-[#321B29] transition hover:border-[#D89A27] hover:bg-[#D89A27]/10"
    >
      <ShoppingBag size={20} />

      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B9472E] px-1 text-[10px] font-extrabold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
