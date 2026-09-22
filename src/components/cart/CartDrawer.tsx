"use client";

import {
  Minus,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";
import { CartItem } from "@/types/cart";
import { menuItems } from "@/data/menuData";

import FoodDetailsModal from "@/components/menu/FoodDetailsModal";

export default function CartDrawer() {
  const router = useRouter();

  const {
    items,
    subtotal,
    isCartOpen,
    openCart,
    closeCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  const [
    editingItem,
    setEditingItem,
  ] = useState<CartItem | null>(null);

  const menuItemBeingEdited = useMemo(() => {
    if (!editingItem) {
      return null;
    }

    return (
      menuItems.find(
        (menuItem) =>
          menuItem.id === editingItem.menuItemId
      ) || null
    );
  }, [editingItem]);

  if (!isCartOpen && !editingItem) {
    return null;
  }

  return (
    <>
      {isCartOpen && (
        <div className="fixed inset-0 z-[150]">
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col bg-[#FFF8EC] shadow-2xl">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-[#321B29]/10 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#321B29] text-[#D89A27]">
                  <ShoppingBag size={19} />
                </div>

                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#B9472E]">
                    Your Order
                  </p>

                  <h2 className="font-[var(--font-cormorant)] text-3xl font-bold leading-none text-[#321B29]">
                    Cart
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#321B29]/10 text-[#321B29] transition hover:bg-[#321B29] hover:text-white"
                aria-label="Close cart"
              >
                <X size={19} />
              </button>
            </div>

            {/* EMPTY CART */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#321B29]/10 text-[#321B29]">
                  <ShoppingBag size={28} />
                </div>

                <h3 className="mt-5 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
                  Your cart is empty
                </h3>

                <p className="mt-2 max-w-[280px] text-sm font-semibold leading-6 text-[#151313]/60">
                  Choose a meal from the menu and it will appear here.
                </p>

                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-6 rounded-lg bg-[#321B29] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#B9472E]"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              <>
                {/* CART ITEMS */}
                <div className="no-scrollbar flex-1 overflow-x-hidden overflow-y-auto px-5 py-4">

                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs font-extrabold text-[#B9472E] transition hover:underline"
                    >
                      Clear Cart
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => {
                      const addOnTotal =
                        item.addOns.reduce(
                          (sum, addOn) =>
                            sum + addOn.price,
                          0
                        );

                      const unitPrice =
                        item.size.price + addOnTotal;

                      const lineTotal =
                        unitPrice * item.quantity;

                      return (
                        <article
                          key={item.id}
                          className="rounded-[18px] border border-[#321B29]/10 bg-white p-4 shadow-[0_4px_14px_rgba(50,27,41,0.05)]"
                        >
                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0 flex-1">
                              <p className="break-words font-[var(--font-cormorant)] text-2xl font-bold leading-tight text-[#321B29]">
                                {item.name}
                              </p>

                              <p className="mt-1 text-xs font-bold text-[#151313]/55">
                                {item.size.label}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  closeCart();
                                  setEditingItem(item);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D89A27]/15 text-[#321B29] transition hover:bg-[#D89A27]"
                                aria-label={`Edit ${item.name}`}
                              >
                                <Pencil size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(item.id)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B9472E]/10 text-[#B9472E] transition hover:bg-[#B9472E] hover:text-white"
                                aria-label={`Remove ${item.name}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* ADD-ONS */}
                          {item.addOns.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {item.addOns.map(
                                (addOn) => (
                                  <span
                                    key={addOn.name}
                                    className="rounded-full bg-[#FFF8EC] px-2.5 py-1 text-[10px] font-bold text-[#321B29]/70"
                                  >
                                    + {addOn.name}
                                  </span>
                                )
                              )}
                            </div>
                          )}

                          {/* QUANTITY + PRICE */}
                          <div className="mt-4 flex items-center justify-between border-t border-[#321B29]/10 pt-3">

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(item.id)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#321B29]/15 text-[#321B29] transition hover:border-[#D89A27]"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>

                              <span className="min-w-[22px] text-center text-sm font-extrabold text-[#321B29]">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(item.id)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#321B29] text-white transition hover:bg-[#B9472E]"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#151313]/45">
                                Total
                              </p>

                              <p className="font-[var(--font-cormorant)] text-2xl font-bold leading-none text-[#321B29]">
                                €{lineTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                {/* FOOTER */}
                <div className="border-t border-[#321B29]/10 bg-white px-5 py-5">

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#321B29]/65">
                      Subtotal
                    </span>

                    <span className="font-[var(--font-cormorant)] text-4xl font-bold text-[#321B29]">
                      €{subtotal.toFixed(2)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-semibold leading-5 text-[#151313]/45">
                    Delivery or pickup details will be confirmed before the order is sent.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      closeCart();
                      router.push("/order");
                    }}
                    className="mt-4 w-full rounded-xl bg-[#321B29] px-5 py-4 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"
                  >
                    Continue Order
                  </button>

                </div>
              </>
            )}

          </aside>
        </div>
      )}

      {/* EDIT MEAL MODAL */}
      {editingItem &&
        menuItemBeingEdited && (
          <FoodDetailsModal
            item={menuItemBeingEdited}
            editingItem={editingItem}
            onClose={() => {
              setEditingItem(null);
              openCart();
            }}
          />
        )}
    </>
  );
}
