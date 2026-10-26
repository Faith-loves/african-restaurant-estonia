"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

const CartDrawer = dynamic(() => import("./CartDrawer"));

export default function LazyCartDrawer() {
  const { isCartOpen } = useCart();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      queueMicrotask(() => setOpened(true));
    }
  }, [isCartOpen]);

  // Retain the editor state when the drawer closes to edit a meal.
  return isCartOpen || opened ? <CartDrawer /> : null;
}
