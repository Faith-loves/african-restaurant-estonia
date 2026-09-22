"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CartItem } from "@/types/cart";

type NewCartItem = Omit<CartItem, "id">;

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;

  isCartOpen: boolean;

  addItem: (item: NewCartItem) => void;

  updateItem: (
    existingId: string,
    item: NewCartItem
  ) => void;

  removeItem: (id: string) => void;

  increaseQuantity: (id: string) => void;

  decreaseQuantity: (id: string) => void;

  clearCart: () => void;

  openCart: () => void;

  closeCart: () => void;
};

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

const MAX_QUANTITY = 99;

function isValidPrice(value: number) {
  return (
    Number.isFinite(value) &&
    value > 0
  );
}

function normaliseQuantity(
  value: number
) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(
    MAX_QUANTITY,
    Math.max(
      1,
      Math.floor(value)
    )
  );
}

function prepareCartItem(
  item: NewCartItem
): NewCartItem | null {
  if (
    !item.menuItemId ||
    !item.name ||
    !item.size?.label ||
    !isValidPrice(
      item.size.price
    )
  ) {
    return null;
  }

  const safeAddOns =
    Array.isArray(item.addOns)
      ? item.addOns.filter(
          (addOn) =>
            Boolean(
              addOn.name
            ) &&
            Number.isFinite(
              addOn.price
            ) &&
            addOn.price >= 0
        )
      : [];

  return {
    ...item,

    size: {
      label: item.size.label,
      price: item.size.price,
    },

    addOns: safeAddOns,

    quantity:
      normaliseQuantity(
        item.quantity
      ),
  };
}

function createCartId(
  item: NewCartItem
) {
  const addOns = item.addOns
    .map(
      (addOn) =>
        addOn.name
    )
    .sort()
    .join("-");

  return [
    item.menuItemId,
    item.size.label,
    addOns ||
      "no-addons",
  ]
    .join("-")
    .toLowerCase()
    .replace(
      /[^a-z0-9-]+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );
}

function restoreStoredItem(
  value: unknown
): CartItem | null {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const candidate =
    value as CartItem;

  const prepared =
    prepareCartItem({
      menuItemId:
        candidate.menuItemId,

      name:
        candidate.name,

      estonianName:
        candidate.estonianName,

      image:
        candidate.image,

      size:
        candidate.size,

      addOns:
        candidate.addOns,

      quantity:
        candidate.quantity,
    });

  if (!prepared) {
    return null;
  }

  return {
    ...prepared,

    id:
      candidate.id ||
      createCartId(
        prepared
      ),
  };
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    items,
    setItems,
  ] =
    useState<CartItem[]>(
      []
    );

  const [
    isCartOpen,
    setIsCartOpen,
  ] =
    useState(false);

  const [
    loaded,
    setLoaded,
  ] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    try {
      const storedCart =
        localStorage.getItem(
          "are-cart"
        );

      if (storedCart) {
        const parsed =
          JSON.parse(
            storedCart
          );

        if (
          Array.isArray(
            parsed
          )
        ) {
          const safeItems =
            parsed
              .map(
                restoreStoredItem
              )
              .filter(
                (
                  item
                ): item is CartItem =>
                  item !==
                  null
              );

          queueMicrotask(() => {
            if (!cancelled) {
              setItems(safeItems);
            }
          });
        }
      }
    } catch {
      localStorage.removeItem(
        "are-cart"
      );
    }

    queueMicrotask(() => {
      if (!cancelled) {
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    localStorage.setItem(
      "are-cart",
      JSON.stringify(
        items
      )
    );
  }, [
    items,
    loaded,
  ]);

  function addItem(
    item: NewCartItem
  ) {
    const prepared =
      prepareCartItem(
        item
      );

    if (!prepared) {
      return;
    }

    const id =
      createCartId(
        prepared
      );

    setItems(
      (
        currentItems
      ) => {
        const existingItem =
          currentItems.find(
            (
              cartItem
            ) =>
              cartItem.id ===
              id
          );

        if (
          existingItem
        ) {
          return currentItems.map(
            (
              cartItem
            ) =>
              cartItem.id ===
              id
                ? {
                    ...cartItem,

                    quantity:
                      normaliseQuantity(
                        cartItem.quantity +
                          prepared.quantity
                      ),
                  }
                : cartItem
          );
        }

        return [
          ...currentItems,

          {
            ...prepared,
            id,
          },
        ];
      }
    );
  }

  function updateItem(
    existingId: string,
    item: NewCartItem
  ) {
    const prepared =
      prepareCartItem(
        item
      );

    if (!prepared) {
      return;
    }

    const newId =
      createCartId(
        prepared
      );

    setItems(
      (
        currentItems
      ) => {
        const remainingItems =
          currentItems.filter(
            (
              cartItem
            ) =>
              cartItem.id !==
              existingId
          );

        const duplicate =
          remainingItems.find(
            (
              cartItem
            ) =>
              cartItem.id ===
              newId
          );

        if (
          duplicate
        ) {
          return remainingItems.map(
            (
              cartItem
            ) =>
              cartItem.id ===
              newId
                ? {
                    ...cartItem,

                    quantity:
                      normaliseQuantity(
                        cartItem.quantity +
                          prepared.quantity
                      ),
                  }
                : cartItem
          );
        }

        return [
          ...remainingItems,

          {
            ...prepared,
            id: newId,
          },
        ];
      }
    );
  }

  function removeItem(
    id: string
  ) {
    setItems(
      (
        currentItems
      ) =>
        currentItems.filter(
          (item) =>
            item.id !== id
        )
    );
  }

  function increaseQuantity(
    id: string
  ) {
    setItems(
      (
        currentItems
      ) =>
        currentItems.map(
          (item) =>
            item.id === id
              ? {
                  ...item,

                  quantity:
                    normaliseQuantity(
                      item.quantity +
                        1
                    ),
                }
              : item
        )
    );
  }

  function decreaseQuantity(
    id: string
  ) {
    setItems(
      (
        currentItems
      ) =>
        currentItems
          .map(
            (item) =>
              item.id ===
              id
                ? {
                    ...item,

                    quantity:
                      item.quantity -
                      1,
                  }
                : item
          )
          .filter(
            (item) =>
              item.quantity >
              0
          )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount =
    useMemo(
      () =>
        items.reduce(
          (
            total,
            item
          ) =>
            total +
            item.quantity,
          0
        ),
      [items]
    );

  const subtotal =
    useMemo(() => {
      return items.reduce(
        (
          total,
          item
        ) => {
          if (
            !isValidPrice(
              item.size.price
            )
          ) {
            return total;
          }

          const addOnsTotal =
            item.addOns.reduce(
              (
                sum,
                addOn
              ) => {
                if (
                  !Number.isFinite(
                    addOn.price
                  ) ||
                  addOn.price <
                    0
                ) {
                  return sum;
                }

                return (
                  sum +
                  addOn.price
                );
              },
              0
            );

          const lineTotal =
            (
              item.size.price +
              addOnsTotal
            ) *
            normaliseQuantity(
              item.quantity
            );

          return (
            total +
            lineTotal
          );
        },
        0
      );
    }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,

        isCartOpen,

        addItem,
        updateItem,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        clearCart,

        openCart: () =>
          setIsCartOpen(
            true
          ),

        closeCart: () =>
          setIsCartOpen(
            false
          ),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(
      CartContext
    );

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
