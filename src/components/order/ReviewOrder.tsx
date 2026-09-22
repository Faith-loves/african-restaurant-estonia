"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { OrderDetails } from "@/types/order";

const WHATSAPP_NUMBER = "37253078208";

type OrderApiSuccess = {
  success: true;
  orderId: string;
  reference: string;
  subtotal: number;
  currency: string;
  status: string;
};

type OrderApiError = {
  error?: string;
};

export default function ReviewOrder() {
  const router = useRouter();
  const {
    items,
    subtotal,
    clearCart,
  } = useCart();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    details,
    setDetails,
  ] =
    useState<OrderDetails | null>(
      null
    );

  const [
    loaded,
    setLoaded,
  ] =
    useState(false);

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    submitError,
    setSubmitError,
  ] =
    useState("");

  const [
    submittedReference,
    setSubmittedReference,
  ] =
    useState("");

  useEffect(() => {
    let cancelled = false;
    const stored =
      sessionStorage.getItem(
        "are-order-details"
      );

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        queueMicrotask(() => {
          if (!cancelled) {
            setDetails(parsed);
          }
        });
      } catch {
        sessionStorage.removeItem(
          "are-order-details"
        );
      }
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

  if (!loaded) {
    return (
      <div className="min-h-[60vh] bg-[#FFF8EC]" />
    );
  }

  if (
    !details ||
    items.length === 0
  ) {
    return (
      <section className="min-h-[70vh] bg-[#FFF8EC] px-5 py-16">
        <div className="mx-auto max-w-[600px] text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#321B29] text-[#D89A27]">
            <ShoppingBag size={28} />
          </div>

          <h1 className="mt-5 font-[var(--font-cormorant)] text-5xl font-bold text-[#321B29]">
            Nothing to review yet
          </h1>

          <p className="mt-3 font-semibold leading-7 text-[#151313]/60">
            Complete your order details first.
          </p>

          <Link
            href="/order"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#321B29] px-6 py-3.5 text-sm font-extrabold text-white"
          >
            <ArrowLeft size={17} />
            Order Details
          </Link>
        </div>
      </section>
    );
  }

  function createWhatsAppMessage(
    reference: string,
    confirmedSubtotal: number
  ) {
    if (!details) {
      return "";
    }

    const euro = "\u20AC";
    const multiply = "\u00D7";

    const orderLines =
      items.map(
        (
          item,
          index
        ) => {
          const addOnTotal =
            item.addOns.reduce(
              (
                sum,
                addOn
              ) =>
                sum +
                addOn.price,
              0
            );

          const total =
            (
              item.size.price +
              addOnTotal
            ) *
            item.quantity;

          const addOns =
            item.addOns.length > 0
              ? `\n   Extras: ${item.addOns
                  .map(
                    (addOn) =>
                      `${addOn.name} (+${euro}${addOn.price.toFixed(
                        2
                      )})`
                  )
                  .join(", ")}`
              : "";

          return `${index + 1}. ${item.quantity} ${multiply} ${item.name}
   Size: ${item.size.label}
   Price: ${euro}${total.toFixed(2)}${addOns}`;
        }
      );

    const deliveryDetails =
      details.fulfilment ===
      "delivery"
        ? `
DELIVERY ADDRESS
${details.address}
${details.city}${
            details.postalCode
              ? `, ${details.postalCode}`
              : ""
          }
`
        : `
PICKUP
Customer will collect the order.
`;

    const recipientDetails =
      details.orderingForSomeoneElse
        ? `
RECIPIENT
Name: ${details.recipientName}
Phone: ${details.recipientPhone}
`
        : "";

    const notes =
      details.notes
        ? `
ORDER NOTES
${details.notes}
`
        : "";

    return `Hello African Restaurant Estonia,

I have submitted an order through the website.

ORDER REFERENCE
${reference}

CUSTOMER DETAILS
Name: ${details.name}
Phone: ${details.phone}
Email: ${details.email}

ORDER TYPE
${details.fulfilment.toUpperCase()}
${deliveryDetails}
${recipientDetails}
ORDER
${orderLines.join("\n\n")}

SUBTOTAL
Subtotal: ${euro}${confirmedSubtotal.toFixed(2)}
${notes}
Please confirm availability and the final order details.

Thank you.`;
  }
  function openWhatsApp(
    reference: string,
    confirmedSubtotal: number
  ) {
    const message =
      createWhatsAppMessage(
        reference,
        confirmedSubtotal
      );

    const url =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function handleConfirmOrder() {
    if (submittedReference) {
      openWhatsApp(
        submittedReference,
        subtotal
      );

      clearCart();

      sessionStorage.removeItem(
        "are-order-details"
      );

      sessionStorage.removeItem(
        "are-order-idempotency-key"
      );

      router.push("/");

      return;
    }
    if (
      sending ||
      !details
    ) {
      return;
    }

    setSending(true);
    setSubmitError("");

    try {
      let idempotencyKey =
        sessionStorage.getItem(
          "are-order-idempotency-key"
        );

      if (!idempotencyKey) {
        idempotencyKey =
          crypto.randomUUID();

        sessionStorage.setItem(
          "are-order-idempotency-key",
          idempotencyKey
        );
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (user) {
        try {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch {
          // Keep the existing guest ordering path if a token cannot be refreshed.
        }
      }

      const response =
        await fetch(
          "/api/orders",
          {
            method: "POST",

            headers,

            body:
              JSON.stringify({
                details,
                items,
                idempotencyKey,
              }),
          }
        );

      const result =
        (await response.json()) as
          | OrderApiSuccess
          | OrderApiError;

      if (
        !response.ok ||
        !(
          "success" in
          result
        ) ||
        result.success !== true
      ) {
        const message =
          "error" in result &&
          typeof result.error ===
            "string"
            ? result.error
            : "We could not submit your order. Please try again.";

        throw new Error(
          message
        );
      }

      setSubmittedReference(
        result.reference
      );
    } catch (error) {
      console.error(
        "Order submission error:",
        error
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not submit your order. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="bg-[#FFF8EC] px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1150px]">
        {!submittedReference && (
          <Link
            href="/order"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#321B29] hover:text-[#B9472E]"
          >
            <ArrowLeft size={17} />
            Edit Order Details
          </Link>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#B9472E]">
            Almost Done
          </p>

          <h1 className="mt-2 font-[var(--font-cormorant)] text-4xl font-bold text-[#321B29] sm:text-5xl md:text-6xl">
            Review Your Order
          </h1>

          <p className="mx-auto mt-3 max-w-[600px] font-semibold leading-7 text-[#151313]/60">
            Check your meals and customer details
            before submitting the order to African
            Restaurant Estonia.
          </p>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            {/* ORDER TYPE */}
            <div className="rounded-[20px] border border-[#321B29]/10 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#321B29] text-[#D89A27]">
                  {details.fulfilment ===
                  "delivery" ? (
                    <Truck
                      size={19}
                    />
                  ) : (
                    <Store
                      size={19}
                    />
                  )}
                </div>

                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#B9472E]">
                    Fulfilment
                  </p>

                  <h2 className="font-[var(--font-cormorant)] text-2xl font-bold capitalize text-[#321B29]">
                    {
                      details.fulfilment
                    }
                  </h2>
                </div>
              </div>
            </div>

            {/* CUSTOMER */}
            <div className="rounded-[20px] border border-[#321B29]/10 bg-white p-5">
              <div className="flex items-center gap-3">
                <UserRound
                  size={19}
                  className="text-[#B9472E]"
                />

                <h2 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                  Customer Details
                </h2>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#FFF8EC] p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#151313]/40">
                    Name
                  </p>

                  <p className="mt-1 font-bold text-[#321B29]">
                    {
                      details.name
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-[#FFF8EC] p-4">
                  <p className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#151313]/40">
                    <Phone
                      size={12}
                    />
                    Phone
                  </p>

                  <p className="mt-1 font-bold text-[#321B29]">
                    {
                      details.phone
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-[#FFF8EC] p-4 sm:col-span-2">
                  <p className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#151313]/40">
                    <Mail
                      size={12}
                    />
                    Email
                  </p>

                  <p className="mt-1 break-all font-bold text-[#321B29]">
                    {
                      details.email
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* ADDRESS */}
            {details.fulfilment ===
              "delivery" && (
              <div className="rounded-[20px] border border-[#321B29]/10 bg-white p-5">
                <div className="flex items-center gap-2">
                  <MapPin
                    size={19}
                    className="text-[#B9472E]"
                  />

                  <h2 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                    Delivery Address
                  </h2>
                </div>

                <p className="mt-4 font-semibold leading-7 text-[#151313]/70">
                  {
                    details.address
                  }
                  <br />
                  {
                    details.city
                  }
                  {details.postalCode
                    ? `, ${details.postalCode}`
                    : ""}
                </p>
              </div>
            )}

            {/* RECIPIENT */}
            {details.orderingForSomeoneElse && (
              <div className="rounded-[20px] border border-[#321B29]/10 bg-white p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#B9472E]">
                  Recipient
                </p>

                <h2 className="mt-1 font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                  Ordering for Someone Else
                </h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#FFF8EC] p-4">
                    <p className="text-xs font-extrabold uppercase text-[#151313]/40">
                      Recipient Name
                    </p>

                    <p className="mt-1 font-bold text-[#321B29]">
                      {
                        details.recipientName
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#FFF8EC] p-4">
                    <p className="text-xs font-extrabold uppercase text-[#151313]/40">
                      Recipient Phone
                    </p>

                    <p className="mt-1 font-bold text-[#321B29]">
                      {
                        details.recipientPhone
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* NOTES */}
            {details.notes && (
              <div className="rounded-[20px] border border-[#321B29]/10 bg-white p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#B9472E]">
                  Notes
                </p>

                <p className="mt-3 whitespace-pre-wrap font-semibold leading-7 text-[#151313]/70">
                  {
                    details.notes
                  }
                </p>
              </div>
            )}
          </div>

          {/* SUMMARY */}
          <aside className="h-fit rounded-[22px] border border-[#321B29]/10 bg-white p-5 shadow-[0_8px_30px_rgba(50,27,41,0.08)] lg:sticky lg:top-[125px]">
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={20}
                className="text-[#B9472E]"
              />

              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#B9472E]">
                Final Check
              </p>
            </div>

            <h2 className="mt-2 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
              Your Meals
            </h2>

            <div className="mt-5 space-y-4">
              {items.map(
                (item) => {
                  const extras =
                    item.addOns.reduce(
                      (
                        sum,
                        addOn
                      ) =>
                        sum +
                        addOn.price,
                      0
                    );

                  const itemTotal =
                    (
                      item.size
                        .price +
                      extras
                    ) *
                    item.quantity;

                  return (
                    <div
                      key={
                        item.id
                      }
                      className="border-b border-[#321B29]/10 pb-4 last:border-0"
                    >
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="break-words font-bold text-[#321B29]">
                            {
                              item.quantity
                            }{" "}
                            ×{" "}
                            {
                              item.name
                            }
                          </p>

                          <p className="mt-1 text-xs font-semibold text-[#151313]/50">
                            {
                              item
                                .size
                                .label
                            }
                          </p>
                        </div>

                        <p className="shrink-0 font-extrabold text-[#321B29]">
                          €
                          {itemTotal.toFixed(
                            2
                          )}
                        </p>
                      </div>

                      {item.addOns
                        .length >
                        0 && (
                        <p className="mt-2 text-xs font-semibold leading-5 text-[#151313]/50">
                          +{" "}
                          {item.addOns
                            .map(
                              (
                                addOn
                              ) =>
                                addOn.name
                            )
                            .join(
                              ", "
                            )}
                        </p>
                      )}
                    </div>
                  );
                }
              )}
            </div>

            <div className="mt-5 border-t border-[#321B29]/10 pt-5">
              <div className="flex items-end justify-between">
                <span className="font-bold text-[#151313]/60">
                  Subtotal
                </span>

                <span className="font-[var(--font-cormorant)] text-4xl font-bold text-[#321B29]">
                  €
                  {subtotal.toFixed(
                    2
                  )}
                </span>
              </div>

              {details.fulfilment ===
                "delivery" && (
                <p className="mt-3 rounded-xl bg-[#FFF8EC] p-3 text-xs font-semibold leading-5 text-[#151313]/55">
                  Any delivery charge will be
                  confirmed by the restaurant.
                </p>
              )}

              {submitError && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#B9472E]/20 bg-[#B9472E]/5 p-3 text-sm font-semibold leading-5 text-[#B9472E]">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <p>
                    {
                      submitError
                    }
                  </p>
                </div>
              )}

              {submittedReference && (
                <div className="mt-4 rounded-xl border border-[#D89A27]/30 bg-[#FFF8EC] p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#B9472E]">
                    Order Submitted
                  </p>

                  <p className="mt-1 font-bold text-[#321B29]">
                    Reference:{" "}
                    {
                      submittedReference
                    }
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-5 text-[#151313]/55">
                    Your order has been saved. Continue
                    on WhatsApp so the restaurant can
                    confirm it.
                  </p>
                </div>
              )}

              {!submittedReference && (
                <Link
                  href="/order"
                  className="mt-5 flex w-full items-center justify-center rounded-xl border border-[#321B29]/15 px-5 py-3 text-sm font-extrabold text-[#321B29] transition hover:border-[#D89A27]"
                >
                  Edit Details
                </Link>
              )}

              <button
                type="button"
                disabled={sending || authLoading}
                onClick={
                  handleConfirmOrder
                }
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#321B29] px-5 py-4 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29] disabled:cursor-wait disabled:opacity-70"
              >
                <MessageCircle
                  size={18}
                />

                {authLoading
                  ? "Checking Account..."
                  : sending
                  ? "Submitting Order..."
                  : submittedReference
                    ? "Continue on WhatsApp"
                    : "Submit Order & Continue on WhatsApp"}
              </button>

              <p className="mt-3 text-center text-[11px] font-semibold leading-5 text-[#151313]/45">
                By submitting, you acknowledge the{" "}
                <Link href="/terms" className="font-bold text-[#294B73] underline">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-bold text-[#294B73] underline">
                  Privacy Policy
                </Link>.
              </p>

              <p className="mt-3 text-center text-[11px] font-semibold leading-5 text-[#151313]/45">
                Your cart stays saved until the order
                has been confirmed with the restaurant.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}




