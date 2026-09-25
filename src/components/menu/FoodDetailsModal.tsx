"use client";

import {
  Check,
  Minus,
  Plus,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { MenuItem } from "@/types/menu";
import { CartItem } from "@/types/cart";
import { useCart } from "@/context/CartContext";
import { restaurantDrinkAddOns } from "@/data/menuData";

type FoodDetailsModalProps = {
  item: MenuItem | null;
  onClose: () => void;
  editingItem?: CartItem | null;
};

type MenuSizeEntry =
  MenuItem["sizes"][number];

type MenuAddOnEntry =
  NonNullable<
    MenuItem["addOns"]
  >[number];

type PricedSize =
  MenuSizeEntry & {
    price: number;
  };

type PricedAddOn =
  MenuAddOnEntry & {
    price: number;
  };

const MAX_QUANTITY = 99;

function hasValidSizePrice(
  size: MenuSizeEntry
): size is PricedSize {
  return (
    typeof size.price === "number" &&
    Number.isFinite(size.price) &&
    size.price > 0
  );
}

function hasValidAddOnPrice(
  addOn: MenuAddOnEntry
): addOn is PricedAddOn {
  return (
    typeof addOn.price === "number" &&
    Number.isFinite(addOn.price) &&
    addOn.price >= 0
  );
}

export default function FoodDetailsModal({
  item,
  onClose,
  editingItem = null,
}: FoodDetailsModalProps) {
  const {
    addItem,
    updateItem,
    openCart,
  } = useCart();

  const [
    selectedSizeIndex,
    setSelectedSizeIndex,
  ] = useState(0);

  const [
    selectedAddOns,
    setSelectedAddOns,
  ] = useState<string[]>([]);

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const validSizes =
    useMemo<PricedSize[]>(
      () => {
        if (!item) {
          return [];
        }

        return item.sizes.filter(
          hasValidSizePrice
        );
      },
      [item]
    );

  const validAddOns =
    useMemo<PricedAddOn[]>(
      () => {
        if (
          !item ||
          !item.addOns
        ) {
          return [];
        }

        return item.addOns.filter(
          hasValidAddOnPrice
        );
      },
      [item]
    );

  useEffect(() => {
    if (!item) {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      if (editingItem) {
      const sizeIndex =
        validSizes.findIndex(
          (size) =>
            size.label ===
            editingItem.size.label
        );

      setSelectedSizeIndex(
        sizeIndex >= 0
          ? sizeIndex
          : 0
      );

      const existingAddOns =
        editingItem.addOns
          .map(
            (addOn) =>
              addOn.name
          )
          .filter(
            (name) =>
              validAddOns.some(
                (addOn) =>
                  addOn.name ===
                  name
              )
          );

      setSelectedAddOns(
        existingAddOns
      );

      setQuantity(
        Math.min(
          MAX_QUANTITY,
          Math.max(
            1,
            editingItem.quantity
          )
        )
      );
      } else {
        setSelectedSizeIndex(0);
        setSelectedAddOns([]);
        setQuantity(1);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    item,
    editingItem,
    validSizes,
    validAddOns,
  ]);

  const selectedSize =
    validSizes[
      selectedSizeIndex
    ];

  const chosenAddOns =
    useMemo<PricedAddOn[]>(
      () => {
        return validAddOns.filter(
          (addOn) =>
            selectedAddOns.includes(
              addOn.name
            )
        );
      },
      [
        validAddOns,
        selectedAddOns,
      ]
    );

  const drinkAddOnNames = useMemo<Set<string>>(
    () => new Set<string>(restaurantDrinkAddOns.map((drink) => drink.name)),
    []
  );

  const extraAddOns = validAddOns.filter(
    (addOn) => !drinkAddOnNames.has(addOn.name)
  );

  const drinkAddOns = (item?.addOns ?? []).filter(
    (addOn) => drinkAddOnNames.has(addOn.name)
  );

  const total =
    useMemo(() => {
      if (!selectedSize) {
        return 0;
      }

      const addOnTotal =
        chosenAddOns.reduce(
          (
            sum,
            addOn
          ) =>
            sum +
            addOn.price,
          0
        );

      return (
        selectedSize.price +
        addOnTotal
      ) * quantity;
    }, [
      selectedSize,
      chosenAddOns,
      quantity,
    ]);

  if (!item) {
    return null;
  }

  /*
    Creating a separate non-null constant
    also keeps TypeScript happy inside
    event-handler functions.
  */
  const currentItem = item;

  const canOrder =
    currentItem.available &&
    Boolean(selectedSize) &&
    total > 0;

  function toggleAddOn(
    name: string
  ) {
    setSelectedAddOns(
      (current) =>
        current.includes(name)
          ? current.filter(
              (addOnName) =>
                addOnName !==
                name
            )
          : [
              ...current,
              name,
            ]
    );
  }

  function decreaseQuantity() {
    setQuantity(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );
  }

  function increaseQuantity() {
    setQuantity(
      (current) =>
        Math.min(
          MAX_QUANTITY,
          current + 1
        )
    );
  }

  function handleSave() {
    if (
      !canOrder ||
      !selectedSize
    ) {
      return;
    }

    const cartItem = {
      menuItemId:
        currentItem.id,

      name:
        currentItem.name,

      estonianName:
        currentItem.estonianName,

      image:
        currentItem.image,

      size: {
        label:
          selectedSize.label,

        price:
          selectedSize.price,
      },

      addOns:
        chosenAddOns.map(
          (addOn) => ({
            name:
              addOn.name,

            price:
              addOn.price,
          })
        ),

      quantity,
    };

    if (editingItem) {
      updateItem(
        editingItem.id,
        cartItem
      );
    } else {
      addItem(
        cartItem
      );
    }

    onClose();
    openCart();
  }

  return (
    <div
      className="fixed inset-0 z-[160] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="food-details-title"
        className="no-scrollbar max-h-[92vh] w-full overflow-x-hidden overflow-y-auto overscroll-contain rounded-t-[28px] bg-[#FFF8EC] shadow-2xl sm:max-w-[620px] sm:rounded-[28px]"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#321B29]/10 bg-[#FFF8EC] px-5 py-5 sm:px-6">

          <div>
            <p className="break-words text-xs font-extrabold uppercase tracking-[0.18em] text-[#B9472E]">
              {editingItem
                ? "Edit Your Meal"
                : "Build Your Meal"}
            </p>

            <h2 id="food-details-title" className="mt-1 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
              {currentItem.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#321B29]/10 text-[#321B29] transition hover:bg-[#321B29] hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>

        </div>

        <div className="px-5 py-6 sm:px-6">

          {/* DESCRIPTION */}
          <p className="text-sm font-semibold leading-6 text-[#151313]/65">
            {currentItem.description}
          </p>

          {/* SOLD OUT */}
          {!currentItem.available && (
            <div className="mt-5 rounded-xl border border-[#B9472E]/20 bg-[#B9472E]/10 px-4 py-3">

              <p className="font-extrabold text-[#B9472E]">
                Not available today
              </p>

              <p className="mt-1 text-xs font-semibold leading-5 text-[#151313]/60">
                This meal is currently unavailable and cannot be added to the cart.
              </p>

            </div>
          )}

          {/* PRICE PENDING */}
          {currentItem.available &&
            validSizes.length ===
              0 && (
              <div className="mt-5 rounded-xl border border-[#D89A27]/30 bg-[#D89A27]/10 px-4 py-3">

                <p className="font-extrabold text-[#321B29]">
                  Price not available yet
                </p>

                <p className="mt-1 text-xs font-semibold leading-5 text-[#151313]/60">
                  This meal is listed on the menu, but its confirmed price has not been added yet.
                </p>

              </div>
            )}

          {/* SIZE */}
          {validSizes.length >
            0 && (
            <div className="mt-6">

              <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                Choose Size
              </h3>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">

                {validSizes.map(
                  (
                    size,
                    index
                  ) => {
                    const selected =
                      selectedSizeIndex ===
                      index;

                    return (
                      <button
                        key={
                          `${size.label}-${index}`
                        }
                        type="button"
                        onClick={() =>
                          setSelectedSizeIndex(
                            index
                          )
                        }
                        className={`relative rounded-xl border px-4 py-3 text-left transition ${
                          selected
                            ? "border-[#D89A27] bg-[#D89A27]/15"
                            : "border-[#321B29]/10 bg-white hover:border-[#D89A27]"
                        }`}
                      >
                        {selected && (
                          <span className="absolute right-2 top-2 text-[#B9472E]">
                            <Check
                              size={14}
                            />
                          </span>
                        )}

                        <span className="block text-sm font-bold text-[#321B29]">
                          {size.label}
                        </span>

                        <span className="mt-1 block text-sm font-extrabold text-[#B9472E]">
                          €
                          {size.price.toFixed(
                            2
                          )}
                        </span>
                      </button>
                    );
                  }
                )}

              </div>
            </div>
          )}

          {/* EXTRAS */}
          {validAddOns.length >
            0 &&
            validSizes.length >
              0 && (
              <div className="mt-6">

                <p className="mt-1 text-xs font-semibold text-[#151313]/50">
                  Optional
                </p>

                {extraAddOns.length > 0 && (
                  <div>
                    <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                      Add Extras
                    </h3>

                    <div className="mt-3 grid gap-2">
                      {extraAddOns.map((addOn) => {
                        const selected = selectedAddOns.includes(addOn.name);

                        return (
                          <button
                            key={addOn.name}
                            type="button"
                            onClick={() => toggleAddOn(addOn.name)}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
                              selected
                                ? "border-[#D89A27] bg-[#D89A27]/15"
                                : "border-[#321B29]/10 bg-white hover:border-[#D89A27]"
                            }`}
                          >
                            <span className="font-bold text-[#321B29]">{addOn.name}</span>
                            <span className="font-extrabold text-[#B9472E]">+€{addOn.price.toFixed(2)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {drinkAddOns.length > 0 && (
                  <div className={extraAddOns.length > 0 ? "mt-5" : ""}>
                    <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                      Drinks
                    </h3>

                    <p className="mt-1 text-xs font-semibold text-[#151313]/50">
                      Choose a drink to add to your meal
                    </p>

                    <div className="mt-3 grid gap-2">
                      {drinkAddOns.map((addOn) => {
                        const selected = selectedAddOns.includes(addOn.name);
                        const selectable = hasValidAddOnPrice(addOn);

                        return (
                          <button
                            key={addOn.name}
                            type="button"
                            disabled={!selectable}
                            onClick={() => selectable && toggleAddOn(addOn.name)}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
                              selected
                                ? "border-[#D89A27] bg-[#D89A27]/15"
                                : selectable
                                  ? "border-[#321B29]/10 bg-white hover:border-[#D89A27]"
                                  : "cursor-not-allowed border-[#321B29]/10 bg-[#321B29]/5 opacity-70"
                            }`}
                          >
                            <span className="font-bold text-[#321B29]">{addOn.name}</span>
                            <span className="font-extrabold text-[#B9472E]">
                              {selectable ? `+€${addOn.price.toFixed(2)}` : "Price Pending"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

          {/* QUANTITY */}
          {validSizes.length >
            0 && (
            <div className="mt-7 flex items-center justify-between border-t border-[#321B29]/10 pt-5">

              <div>
                <p className="text-xs font-bold text-[#151313]/50">
                  Quantity
                </p>

                <div className="mt-2 flex items-center gap-3">

                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#321B29]/15 bg-white text-[#321B29] disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus
                      size={15}
                    />
                  </button>

                  <span className="min-w-[28px] text-center font-extrabold text-[#321B29]">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >=
                      MAX_QUANTITY
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#321B29] text-white disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus
                      size={15}
                    />
                  </button>

                </div>
              </div>

              <div className="text-right">

                <p className="text-xs font-bold text-[#151313]/50">
                  Total
                </p>

                <p className="font-[var(--font-cormorant)] text-4xl font-bold text-[#321B29]">
                  €
                  {total.toFixed(
                    2
                  )}
                </p>

              </div>

            </div>
          )}

          {/* SAVE BUTTON */}
          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              !canOrder
            }
            className="mt-6 w-full rounded-xl bg-[#321B29] px-5 py-4 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29] disabled:cursor-not-allowed disabled:bg-[#321B29]/30 disabled:text-white"
          >
            {!currentItem.available
              ? "Currently Unavailable"
              : validSizes.length ===
                  0
                ? "Price Pending"
                : editingItem
                  ? `Update Cart · €${total.toFixed(
                      2
                    )}`
                  : `Add to Cart · €${total.toFixed(
                      2
                    )}`}
          </button>

        </div>
      </div>
    </div>
  );
}
