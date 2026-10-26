"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Check,
  MapPin,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import { useCart } from "@/context/CartContext";
import {
  FulfilmentType,
  OrderDetails,
} from "@/types/order";

export default function OrderDetailsForm() {
  const router = useRouter();

  const {
    items,
    subtotal,
  } = useCart();

  const [fulfilment, setFulfilment] =
    useState<FulfilmentType>("pickup");

  const [
    orderingForSomeoneElse,
    setOrderingForSomeoneElse,
  ] = useState(false);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const orderDetails: OrderDetails = {
      fulfilment,

      name:
        formData.get("name")?.toString().trim() || "",

      phone:
        formData.get("phone")?.toString().trim() || "",

      email:
        formData.get("email")?.toString().trim() || "",

      orderingForSomeoneElse,

      notes:
        formData.get("notes")?.toString().trim() || "",
    };

    if (fulfilment === "delivery") {
      orderDetails.address =
        formData.get("address")?.toString().trim() || "";

      orderDetails.city =
        formData.get("city")?.toString().trim() || "";

      orderDetails.postalCode =
        formData
          .get("postalCode")
          ?.toString()
          .trim() || "";

      if (orderingForSomeoneElse) {
        orderDetails.recipientName =
          formData
            .get("recipientName")
            ?.toString()
            .trim() || "";

        orderDetails.recipientPhone =
          formData
            .get("recipientPhone")
            ?.toString()
            .trim() || "";
      }
    }

    sessionStorage.setItem(
      "are-order-details",
      JSON.stringify(orderDetails)
    );

    router.push("/order/review");
  }

  if (items.length === 0) {
    return (
      <section className="min-h-[70vh] bg-[#FFF8EC] px-5 py-16">
        <div className="mx-auto max-w-[600px] text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#321B29] text-[#D89A27]">
            <ShoppingBag size={27} />
          </div>

          <h1 className="mt-5 font-[var(--font-cormorant)] text-5xl font-bold text-[#321B29]">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-3 max-w-md font-semibold leading-7 text-[#151313]/60">
            Add something from the menu before
            continuing your order.
          </p>

          <Link
            href="/menu"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#321B29] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#B9472E]"
          >
            <ArrowLeft size={17} />
            Return to Menu
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#FFF8EC] px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <Link
          href="/menu"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#321B29] transition hover:text-[#B9472E]"
        >
          <ArrowLeft size={17} />
          Back to Menu
        </Link>

        <div className="grid gap-7 lg:grid-cols-[1fr_390px]">

          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#B9472E]">
              Complete Your Order
            </p>

            <h1 className="mt-2 font-[var(--font-cormorant)] text-4xl font-bold leading-none text-[#321B29] sm:text-5xl md:text-6xl">
              Order Details
            </h1>

            <p className="mt-3 max-w-[620px] font-semibold leading-7 text-[#151313]/60">
              Choose how you would like to receive
              your food and enter the information
              needed to prepare your order.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >

              {/* STEP 1 */}
              <div className="rounded-[22px] border border-[#321B29]/10 bg-white p-5 sm:p-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#B9472E]">
                  Step 1
                </p>

                <h2 className="mt-1 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
                  How would you like your food?
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() =>
                      setFulfilment("pickup")
                    }
                    className={`rounded-[16px] border p-4 text-left transition ${
                      fulfilment === "pickup"
                        ? "border-[#D89A27] bg-[#D89A27]/10"
                        : "border-[#321B29]/10 bg-[#FFF8EC]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#321B29] text-[#D89A27]">
                        <Store size={18} />
                      </div>

                      {fulfilment === "pickup" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D89A27] text-white">
                          <Check size={14} />
                        </div>
                      )}
                    </div>

                    <p className="mt-4 font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                      Pickup
                    </p>

                    <p className="mt-1 text-sm font-semibold leading-6 text-[#151313]/60">
                      Collect your order from African
                      Restaurant Estonia.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFulfilment("delivery")
                    }
                    className={`rounded-[16px] border p-4 text-left transition ${
                      fulfilment === "delivery"
                        ? "border-[#D89A27] bg-[#D89A27]/10"
                        : "border-[#321B29]/10 bg-[#FFF8EC]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#321B29] text-[#D89A27]">
                        <Truck size={18} />
                      </div>

                      {fulfilment === "delivery" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D89A27] text-white">
                          <Check size={14} />
                        </div>
                      )}
                    </div>

                    <p className="mt-4 font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                      Delivery
                    </p>

                    <p className="mt-1 text-sm font-semibold leading-6 text-[#151313]/60">
                      Send your order to an address
                      in Estonia.
                    </p>
                  </button>
                </div>

                {fulfilment === "delivery" && (
                  <div className="mt-4 rounded-xl bg-[#294B73]/10 px-4 py-3 text-xs font-bold leading-5 text-[#294B73]">
                    Delivery availability and any
                    applicable delivery charge will be
                    confirmed before the order is
                    finalised.
                  </div>
                )}
              </div>

              {/* STEP 2 */}
              <div className="rounded-[22px] border border-[#321B29]/10 bg-white p-5 sm:p-6">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#321B29] text-[#D89A27]">
                    <UserRound size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#B9472E]">
                      Step 2
                    </p>

                    <h2 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
                      Your Details
                    </h2>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-bold text-[#321B29]"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      required
                      type="text"
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#D89A27]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-bold text-[#321B29]"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      required
                      type="tel"
                      placeholder="+372..."
                      className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#D89A27]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-bold text-[#321B29]"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      required
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#D89A27]"
                    />
                  </div>

                </div>
              </div>

              {/* DELIVERY */}
              {fulfilment === "delivery" && (
                <div className="rounded-[22px] border border-[#321B29]/10 bg-white p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#321B29] text-[#D89A27]">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#B9472E]">
                        Step 3
                      </p>

                      <h2 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
                        Delivery Address
                      </h2>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="address"
                        className="mb-2 block text-sm font-bold text-[#321B29]"
                      >
                        Street Address
                      </label>

                      <input
                        id="address"
                        name="address"
                        required
                        placeholder="Street and house number"
                        className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold outline-none focus:border-[#D89A27]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="mb-2 block text-sm font-bold text-[#321B29]"
                      >
                        City
                      </label>

                      <input
                        id="city"
                        name="city"
                        required
                        placeholder="Tallinn"
                        className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold outline-none focus:border-[#D89A27]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="postalCode"
                        className="mb-2 block text-sm font-bold text-[#321B29]"
                      >
                        Postal Code
                      </label>

                      <input
                        id="postalCode"
                        name="postalCode"
                        required
                        placeholder="11213"
                        className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold outline-none focus:border-[#D89A27]"
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* SOMEONE ELSE */}
              {fulfilment === "delivery" && (
                <div className="rounded-[22px] border border-[#321B29]/10 bg-white p-5 sm:p-6">

                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={
                        orderingForSomeoneElse
                      }
                      onChange={(event) =>
                        setOrderingForSomeoneElse(
                          event.target.checked
                        )
                      }
                      className="mt-1 h-4 w-4 accent-[#321B29]"
                    />

                    <div>
                      <p className="font-extrabold text-[#321B29]">
                        I&apos;m ordering for someone else
                      </p>

                      <p className="mt-1 text-sm font-semibold leading-6 text-[#151313]/55">
                        Use this when the person
                        receiving the food is different
                        from the person paying or
                        placing the order.
                      </p>
                    </div>
                  </label>

                  {orderingForSomeoneElse && (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">

                      <div>
                        <label
                          htmlFor="recipientName"
                          className="mb-2 block text-sm font-bold text-[#321B29]"
                        >
                          Recipient Name
                        </label>

                        <input
                          id="recipientName"
                          name="recipientName"
                          required
                          placeholder="Recipient's name"
                          className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold outline-none focus:border-[#D89A27]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="recipientPhone"
                          className="mb-2 block text-sm font-bold text-[#321B29]"
                        >
                          Recipient Phone
                        </label>

                        <input
                          id="recipientPhone"
                          name="recipientPhone"
                          required
                          type="tel"
                          placeholder="+372..."
                          className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold outline-none focus:border-[#D89A27]"
                        />
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* NOTES */}
              <div className="rounded-[22px] border border-[#321B29]/10 bg-white p-5 sm:p-6">
                <label
                  htmlFor="notes"
                  className="block font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]"
                >
                  Order Notes
                </label>

                <p className="mt-1 text-sm font-semibold text-[#151313]/55">
                  Optional instructions for the
                  restaurant.
                </p>

                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder="Special instructions..."
                  className="no-scrollbar mt-4 w-full resize-none rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-[#D89A27]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#321B29] px-6 py-4 font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"
              >
                Review Order
              </button>

            </form>
          </div>

          {/* SUMMARY */}
          <aside className="h-fit rounded-[22px] border border-[#321B29]/10 bg-white p-5 shadow-[0_8px_30px_rgba(50,27,41,0.07)] lg:sticky lg:top-[125px]">

            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#B9472E]">
              Your Order
            </p>

            <h2 className="mt-1 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
              Order Summary
            </h2>

            <div className="mt-5 space-y-4">

              {items.map((item) => {
                const addOnTotal =
                  item.addOns.reduce(
                    (sum, addOn) =>
                      sum + addOn.price,
                    0
                  );

                const total =
                  (
                    item.size.price +
                    addOnTotal
                  ) * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="border-b border-[#321B29]/10 pb-4 last:border-none"
                  >
                    <div className="flex justify-between gap-3">

                      <div>
                        <p className="font-bold text-[#321B29]">
                          {item.quantity} ×{" "}
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#151313]/50">
                          {item.size.label}
                        </p>
                      </div>

                      <p className="font-extrabold text-[#321B29]">
                        €{total.toFixed(2)}
                      </p>

                    </div>

                    {item.addOns.length > 0 && (
                      <p className="mt-2 text-xs font-semibold leading-5 text-[#151313]/50">
                        {item.addOns
                          .map(
                            (addOn) =>
                              addOn.name
                          )
                          .join(", ")}
                      </p>
                    )}
                  </div>
                );
              })}

            </div>

            <div className="mt-5 border-t border-[#321B29]/10 pt-5">
              <div className="flex items-end justify-between">
                <span className="font-bold text-[#151313]/60">
                  Subtotal
                </span>

                <span className="font-[var(--font-cormorant)] text-4xl font-bold leading-none text-[#321B29]">
                  €{subtotal.toFixed(2)}
                </span>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </section>
  );
}
