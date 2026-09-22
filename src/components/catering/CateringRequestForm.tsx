"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Gift,
  Loader2,
  MapPin,
  MessageCircle,
  PartyPopper,
  Plus,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  db,
} from "@/lib/firebase/client";

import {
  CateringRequest,
  CateringServiceType,
} from "@/types/catering";

type CateringMenuOption = {
  id: string;
  name: string;
  category?: string;
  pricePending?: boolean;
  available?: boolean;
  isTodayMenu?: boolean;
  archived?: boolean;
};

const WHATSAPP_NUMBER = "37253078208";

const services = [
  {
    id: "corporate" as CateringServiceType,
    title: "Corporate Catering",
    description:
      "Office lunches, meetings, team meals, conferences and company events.",
    icon: BriefcaseBusiness,
  },
  {
    id: "event" as CateringServiceType,
    title: "Events",
    description:
      "Birthdays, celebrations, private gatherings and special occasions.",
    icon: PartyPopper,
  },
  {
    id: "gift-box" as CateringServiceType,
    title: "Food Gift Box",
    description:
      "Order a West African food package for someone special in Estonia.",
    icon: Gift,
  },
];

export default function CateringRequestForm() {
  const router = useRouter();
  const [
    serviceType,
    setServiceType,
  ] = useState<CateringServiceType>(
    "corporate"
  );

  const [
    menuItems,
    setMenuItems,
  ] = useState<CateringMenuOption[]>(
    []
  );

  const [
    menuLoading,
    setMenuLoading,
  ] = useState(true);

  const [
    menuError,
    setMenuError,
  ] = useState("");

  const [
    selectedMenuItemId,
    setSelectedMenuItemId,
  ] = useState("");

  const [
    selectedMenuItems,
    setSelectedMenuItems,
  ] = useState<string[]>([]);

  const [
    submittedRequest,
    setSubmittedRequest,
  ] =
    useState<CateringRequest | null>(
      null
    );

  const [
    sendingRequest,
    setSendingRequest,
  ] = useState(false);

  const [
    requestError,
    setRequestError,
  ] = useState("");

  const [
    submittedReference,
    setSubmittedReference,
  ] = useState("");

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "menuItems"
        ),
        (snapshot) => {
          const records =
            snapshot.docs
              .map(
                (
                  menuDocument
                ) => {
                  const data =
                    menuDocument.data();

                  return {
                    id:
                      menuDocument.id,

                    name:
                      typeof data.name ===
                      "string"
                        ? data.name
                        : "",

                    category:
                      typeof data.category ===
                      "string"
                        ? data.category
                        : undefined,

                    pricePending:
                      data.pricePending ===
                      true,

                    available:
                      data.available ===
                      true,

                    isTodayMenu:
                      data.isTodayMenu ===
                      true,

                    archived:
                      data.archived ===
                      true,
                  };
                }
              )
              .filter(
                (item) =>
                  item.name.trim() &&
                  item.archived !==
                    true
              )
              .sort(
                (
                  first,
                  second
                ) =>
                  first.name.localeCompare(
                    second.name
                  )
              );

          setMenuItems(
            records
          );

          setMenuError("");

          setMenuLoading(
            false
          );
        },
        (error) => {
          console.error(
            "Catering menu Firestore error:",
            error
          );

          setMenuError(
            "We could not load the restaurant menu right now. You can still type the food you want in the special request box below."
          );

          setMenuLoading(
            false
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  const menuOptions =
    useMemo(() => {
      return menuItems;
    }, [menuItems]);

  function addMenuItem() {
    if (
      !selectedMenuItemId
    ) {
      return;
    }

    const menuItem =
      menuOptions.find(
        (item) =>
          item.id ===
          selectedMenuItemId
      );

    if (!menuItem) {
      return;
    }

    setSelectedMenuItems(
      (current) => {
        if (
          current.includes(
            menuItem.name
          )
        ) {
          return current;
        }

        return [
          ...current,
          menuItem.name,
        ];
      }
    );

    setSelectedMenuItemId(
      ""
    );
  }

  function removeMenuItem(
    name: string
  ) {
    setSelectedMenuItems(
      (current) =>
        current.filter(
          (item) =>
            item !== name
        )
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const guestCountRaw =
      formData
        .get("guestCount")
        ?.toString()
        .trim();

    const request: CateringRequest = {
      serviceType,

      name:
        formData
          .get("name")
          ?.toString()
          .trim() || "",

      phone:
        formData
          .get("phone")
          ?.toString()
          .trim() || "",

      email:
        formData
          .get("email")
          ?.toString()
          .trim() || "",

      date:
        formData
          .get("date")
          ?.toString()
          .trim() || "",

      location:
        formData
          .get("location")
          ?.toString()
          .trim() || "",

      budget:
        formData
          .get("budget")
          ?.toString()
          .trim() || "",

      selectedMenuItems,

      additionalFood:
        formData
          .get("additionalFood")
          ?.toString()
          .trim() || "",

      notes:
        formData
          .get("notes")
          ?.toString()
          .trim() || "",
    };

    if (
      serviceType ===
      "corporate"
    ) {
      request.companyName =
        formData
          .get("companyName")
          ?.toString()
          .trim() || "";
    }

    if (
      serviceType ===
      "event"
    ) {
      request.eventType =
        formData
          .get("eventType")
          ?.toString()
          .trim() || "";
    }

    if (
      serviceType !==
        "gift-box" &&
      guestCountRaw
    ) {
      request.guestCount =
        Number(
          guestCountRaw
        );
    }

    if (
      serviceType ===
      "gift-box"
    ) {
      request.recipientName =
        formData
          .get(
            "recipientName"
          )
          ?.toString()
          .trim() || "";

      request.recipientPhone =
        formData
          .get(
            "recipientPhone"
          )
          ?.toString()
          .trim() || "";

      request.giftMessage =
        formData
          .get(
            "giftMessage"
          )
          ?.toString()
          .trim() || "";
    }

    sessionStorage.setItem(
      "are-catering-request",
      JSON.stringify(
        request
      )
    );

    setSubmittedRequest(
      request
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function createWhatsAppMessage(
    request: CateringRequest,
    reference: string
  ) {
    const service =
      request.serviceType === "corporate"
        ? "Corporate Catering"
        : request.serviceType === "event"
          ? "Event Catering"
          : "Food Gift Box";

    const foods =
      request.selectedMenuItems.length > 0
        ? request.selectedMenuItems
            .map(
              (item, index) =>
                `${index + 1}. ${item}`
            )
            .join("\n")
        : "No menu foods selected.";

    const company =
      request.companyName
        ? `\nCompany / Organisation: ${request.companyName}`
        : "";

    const event =
      request.eventType
        ? `\nEvent Type: ${request.eventType}`
        : "";

    const guests =
      request.guestCount
        ? `\nNumber of Guests: ${request.guestCount}`
        : "";

    const budget =
      request.budget
        ? `\nEstimated Budget: ${request.budget}`
        : "";

    const recipient =
      request.serviceType === "gift-box"
        ? `

RECIPIENT
Name: ${request.recipientName || ""}
Phone: ${request.recipientPhone || ""}${
            request.giftMessage
              ? `\nGift Message: ${request.giftMessage}`
              : ""
          }`
        : "";

    const additionalFood =
      request.additionalFood
        ? `

ADDITIONAL FOOD / SPECIAL REQUEST
${request.additionalFood}`
        : "";

    const notes =
      request.notes
        ? `

ADDITIONAL NOTES
${request.notes}`
        : "";

    return `Hello African Restaurant Estonia,

I have submitted a ${service} request through the website.

REQUEST REFERENCE
${reference}

CUSTOMER DETAILS
Name: ${request.name}
Phone: ${request.phone}
Email: ${request.email}

REQUEST TYPE
${service}${company}${event}

REQUEST DETAILS
Date: ${request.date}
Location: ${request.location}${guests}${budget}
${recipient}

FOOD SELECTION
${foods}${additionalFood}${notes}

Please confirm availability, pricing and the final details.

Thank you.`;
  }

  function continueOnWhatsApp() {
    if (
      !submittedRequest ||
      !submittedReference
    ) {
      return;
    }

    const message =
      createWhatsAppMessage(
        submittedRequest,
        submittedReference
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

    sessionStorage.removeItem(
      "are-catering-request"
    );

    sessionStorage.removeItem(
      "are-catering-reference"
    );

    sessionStorage.removeItem(
      "are-catering-idempotency-key"
    );

    router.push("/");
  }
  async function sendCateringRequest() {
    if (
      !submittedRequest ||
      sendingRequest ||
      submittedReference
    ) {
      return;
    }

    setSendingRequest(true);
    setRequestError("");

    try {
      let idempotencyKey = sessionStorage.getItem(
        "are-catering-idempotency-key"
      );

      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID();
        sessionStorage.setItem(
          "are-catering-idempotency-key",
          idempotencyKey
        );
      }
      const response = await fetch(
        "/api/catering",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({ ...submittedRequest, idempotencyKey }),
        }
      );

      const result =
        (await response.json()) as {
          success?: boolean;
          reference?: string;
          error?: string;
        };

      if (
        !response.ok ||
        result.success !== true ||
        !result.reference
      ) {
        throw new Error(
          result.error ||
            "We could not send your request. Please try again."
        );
      }

      setSubmittedReference(
        result.reference
      );

      sessionStorage.setItem(
        "are-catering-reference",
        result.reference
      );
    } catch (error) {
      console.error(
        "Catering submission error:",
        error
      );

      setRequestError(
        error instanceof Error
          ? error.message
          : "We could not send your request. Please try again."
      );
    } finally {
      setSendingRequest(false);
    }
  }
  if (submittedRequest) {
    const service =
      services.find(
        (item) =>
          item.id ===
          submittedRequest.serviceType
      );

    return (
      <section className="bg-[#FFF8EC] px-5 py-14 sm:px-8 lg:px-12">

        <div className="mx-auto max-w-[820px]">

          <div className="rounded-[28px] border border-[#321B29]/10 bg-white p-6 shadow-[0_12px_40px_rgba(50,27,41,0.08)] sm:p-9">

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D89A27]/15 text-[#B9472E]">
                <Check
                  size={30}
                />
              </div>

              <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-[#B9472E]">
                Final Check
              </p>

              <h2 className="mt-2 font-[var(--font-cormorant)] text-4xl font-bold text-[#321B29] sm:text-5xl">
                Review Your Request
              </h2>

              <p className="mx-auto mt-3 max-w-[560px] text-sm font-semibold leading-7 text-[#151313]/60">
                Confirm that the information below is correct before the request is sent to African Restaurant Estonia.
              </p>

            </div>

            <div className="mt-8 space-y-3">

              <ReviewBox
                label="Service"
                value={
                  service?.title ||
                  ""
                }
              />

              {submittedRequest.companyName && (
                <ReviewBox
                  label="Company / Organisation"
                  value={
                    submittedRequest.companyName
                  }
                />
              )}

              {submittedRequest.eventType && (
                <ReviewBox
                  label="Event Type"
                  value={
                    submittedRequest.eventType
                  }
                />
              )}

              <div className="grid gap-3 sm:grid-cols-2">

                <ReviewBox
                  label="Your Name"
                  value={
                    submittedRequest.name
                  }
                />

                <ReviewBox
                  label="Phone"
                  value={
                    submittedRequest.phone
                  }
                />

              </div>

              <ReviewBox
                label="Email"
                value={
                  submittedRequest.email
                }
              />

              <div className="grid gap-3 sm:grid-cols-2">

                <ReviewBox
                  label={
                    submittedRequest.serviceType ===
                    "gift-box"
                      ? "Preferred Delivery Date"
                      : "Date"
                  }
                  value={
                    submittedRequest.date
                  }
                />

                {submittedRequest.guestCount && (
                  <ReviewBox
                    label="Number of Guests"
                    value={String(
                      submittedRequest.guestCount
                    )}
                  />
                )}

              </div>

              <ReviewBox
                label={
                  submittedRequest.serviceType ===
                  "gift-box"
                    ? "Delivery Location"
                    : "Location"
                }
                value={
                  submittedRequest.location
                }
              />

              {submittedRequest.serviceType ===
                "gift-box" && (
                <>

                  <div className="mt-5">

                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#B9472E]">
                      Recipient Details
                    </p>

                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">

                    <ReviewBox
                      label="Recipient Name"
                      value={
                        submittedRequest.recipientName ||
                        ""
                      }
                    />

                    <ReviewBox
                      label="Recipient Phone"
                      value={
                        submittedRequest.recipientPhone ||
                        ""
                      }
                    />

                  </div>

                  {submittedRequest.giftMessage && (
                    <ReviewBox
                      label="Gift Message"
                      value={
                        submittedRequest.giftMessage
                      }
                    />
                  )}

                </>
              )}

              {submittedRequest.budget && (
                <ReviewBox
                  label="Estimated Budget"
                  value={
                    submittedRequest.budget
                  }
                />
              )}

              {submittedRequest.selectedMenuItems.length >
                0 && (
                <div className="rounded-xl bg-[#FFF8EC] p-4">

                  <p className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#151313]/40">
                    Selected From Menu
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {submittedRequest.selectedMenuItems.map(
                      (item) => (
                        <span
                          key={item}
                          className="rounded-full bg-[#321B29] px-3 py-1.5 text-xs font-bold text-white"
                        >
                          {item}
                        </span>
                      )
                    )}

                  </div>

                </div>
              )}

              {submittedRequest.additionalFood && (
                <ReviewBox
                  label="Additional Food / Special Request"
                  value={
                    submittedRequest.additionalFood
                  }
                />
              )}

              {submittedRequest.notes && (
                <ReviewBox
                  label="Additional Notes"
                  value={
                    submittedRequest.notes
                  }
                />
              )}

            </div>

            {requestError && (
              <div className="mt-7 flex items-start gap-3 rounded-xl border border-[#B9472E]/20 bg-[#B9472E]/5 p-4 text-sm font-bold text-[#B9472E]">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <p>
                  {requestError}
                </p>
              </div>
            )}

            {submittedReference && (
              <div className="mt-7 rounded-xl border border-[#D89A27]/30 bg-[#FFF8EC] p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#B9472E]">
                  Request Submitted
                </p>

                <p className="mt-2 font-bold text-[#321B29]">
                  Reference:{" "}
                  {submittedReference}
                </p>

                <p className="mt-2 text-sm font-semibold leading-6 text-[#151313]/60">
                  Your request has been saved and received.
                  Continue on WhatsApp so African Restaurant
                  Estonia can discuss availability, pricing
                  and the final details with you.
                </p>
              </div>
            )}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">

              {!submittedReference && (
                <button
                  type="button"
                  onClick={() =>
                    setSubmittedRequest(
                      null
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#321B29]/15 px-5 py-3.5 text-sm font-extrabold text-[#321B29] transition hover:border-[#D89A27]"
                >
                  <ArrowLeft
                    size={16}
                  />

                  Edit Request
                </button>
              )}

              <button
                type="button"
                onClick={
                  submittedReference
                    ? continueOnWhatsApp
                    : sendCateringRequest
                }
                disabled={
                  sendingRequest
                }
                className={`are-catering-send flex items-center justify-center gap-2 rounded-xl bg-[#321B29] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29] disabled:cursor-not-allowed disabled:opacity-50 ${
                  submittedReference
                    ? "sm:col-span-2"
                    : ""
                }`}
              >
                {submittedReference && (
                  <MessageCircle
                    size={17}
                  />
                )}

                {sendingRequest
                  ? "Sending Request..."
                  : submittedReference
                    ? "Continue on WhatsApp"
                    : "Send Request"}
              </button>

            </div>

          </div>

        </div>

      </section>
    );
  }

  return (
    <section className="bg-[#FFF8EC] px-5 py-14 sm:px-8 lg:px-12">

      <div className="mx-auto max-w-[1150px]">

        <div className="mx-auto max-w-[720px] text-center">

          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#B9472E]">
            Catering & Special Orders
          </p>

          <h2 className="mt-2 font-[var(--font-cormorant)] text-4xl font-bold leading-none text-[#321B29] sm:text-5xl md:text-6xl">
            What Are You Planning?
          </h2>

          <p className="mx-auto mt-4 max-w-[640px] font-semibold leading-7 text-[#151313]/60">
            Choose the type of request, select meals from our wider restaurant menu and tell us anything extra you would like.
          </p>

        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">

          {services.map(
            (service) => {
              const Icon =
                service.icon;

              const selected =
                serviceType ===
                service.id;

              return (
                <button
                  key={
                    service.id
                  }
                  type="button"
                  onClick={() =>
                    setServiceType(
                      service.id
                    )
                  }
                  className={`relative rounded-[22px] border p-5 text-left transition ${
                    selected
                      ? "border-[#D89A27] bg-[#D89A27]/10"
                      : "border-[#321B29]/10 bg-white hover:border-[#D89A27]/60"
                  }`}
                >

                  {selected && (
                    <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#D89A27] text-white">
                      <Check
                        size={15}
                      />
                    </div>
                  )}

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#321B29] text-[#D89A27]">
                    <Icon
                      size={21}
                    />
                  </div>

                  <h3 className="mt-5 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
                    {
                      service.title
                    }
                  </h3>

                  <p className="mt-2 text-sm font-semibold leading-6 text-[#151313]/55">
                    {
                      service.description
                    }
                  </p>

                </button>
              );
            }
          )}

        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="mx-auto mt-8 max-w-[850px] rounded-[26px] border border-[#321B29]/10 bg-white p-5 shadow-[0_10px_35px_rgba(50,27,41,0.06)] sm:p-8"
        >

          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#B9472E]">
            Request Details
          </p>

          <h2 className="mt-1 font-[var(--font-cormorant)] text-4xl font-bold text-[#321B29]">
            {serviceType ===
            "corporate"
              ? "Corporate Catering Request"
              : serviceType ===
                  "event"
                ? "Event Catering Request"
                : "Food Gift Box Request"}
          </h2>

          <div className="mt-7">

            <div className="flex items-center gap-2">

              <UserRound
                size={18}
                className="text-[#B9472E]"
              />

              <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                Your Details
              </h3>

            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              <Field
                label="Full Name"
                name="name"
                placeholder="Your full name"
                required
              />

              <Field
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="+372 or international number"
                required
              />

              <div className="sm:col-span-2">

                <Field
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />

              </div>

            </div>

          </div>

          {serviceType ===
            "corporate" && (
            <div className="mt-5">

              <Field
                label="Company / Organisation"
                name="companyName"
                placeholder="Company or organisation name"
                required
              />

            </div>
          )}

          {serviceType ===
            "event" && (
            <div className="mt-5">

              <Field
                label="Type of Event"
                name="eventType"
                placeholder="Birthday, wedding, celebration..."
                required
              />

            </div>
          )}

          <div className="my-7 h-px bg-[#321B29]/10" />

          <div className="grid gap-4 sm:grid-cols-2">

            <div>

              <label
                htmlFor="date"
                className="mb-2 flex items-center gap-2 text-sm font-bold text-[#321B29]"
              >
                <CalendarDays
                  size={16}
                />

                {serviceType ===
                "gift-box"
                  ? "Preferred Delivery Date"
                  : "Date"}
              </label>

              <input
                id="date"
                name="date"
                type="date"
                required
                className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold text-[#321B29] outline-none focus:border-[#D89A27]"
              />

            </div>

            {serviceType !==
              "gift-box" && (
              <div>

                <label
                  htmlFor="guestCount"
                  className="mb-2 flex items-center gap-2 text-sm font-bold text-[#321B29]"
                >
                  <Users
                    size={16}
                  />

                  Number of Guests
                </label>

                <input
                  id="guestCount"
                  name="guestCount"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 50"
                  className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold text-[#321B29] outline-none focus:border-[#D89A27]"
                />

              </div>
            )}

          </div>

          <div className="mt-4">

            <label
              htmlFor="location"
              className="mb-2 flex items-center gap-2 text-sm font-bold text-[#321B29]"
            >
              <MapPin
                size={16}
              />

              {serviceType ===
              "gift-box"
                ? "Delivery Location"
                : "Location"}
            </label>

            <input
              id="location"
              name="location"
              required
              placeholder={
                serviceType ===
                "gift-box"
                  ? "Recipient address or delivery area in Estonia"
                  : "Venue or event address"
              }
              className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold text-[#321B29] outline-none focus:border-[#D89A27]"
            />

          </div>

          {serviceType ===
            "gift-box" && (
            <div className="mt-7 rounded-[20px] bg-[#FFF8EC] p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#321B29] text-[#D89A27]">
                  <Gift
                    size={18}
                  />
                </div>

                <div>

                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#B9472E]">
                    Recipient
                  </p>

                  <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                    Who Is Receiving It?
                  </h3>

                </div>

              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <Field
                  label="Recipient Name"
                  name="recipientName"
                  placeholder="Recipient's full name"
                  required
                />

                <Field
                  label="Recipient Phone"
                  name="recipientPhone"
                  type="tel"
                  placeholder="+372..."
                  required
                />

              </div>

              <div className="mt-4">

                <label
                  htmlFor="giftMessage"
                  className="mb-2 block text-sm font-bold text-[#321B29]"
                >
                  Gift Message (optional)
                </label>

                <textarea
                  id="giftMessage"
                  name="giftMessage"
                  rows={3}
                  placeholder="Short message for the recipient..."
                  className="no-scrollbar w-full resize-none rounded-xl border border-[#321B29]/15 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#D89A27]"
                />

              </div>

            </div>
          )}

          <div className="mt-6">

            <Field
              label="Estimated Budget (optional)"
              name="budget"
              placeholder="Example: €300 - €500"
            />

          </div>

          <div className="my-7 h-px bg-[#321B29]/10" />

          <div>

            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#B9472E]">
              Food Selection
            </p>

            <h3 className="mt-1 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
              Choose From Our Menu
            </h3>

            <p className="mt-1 text-sm font-semibold leading-6 text-[#151313]/50">
              This is an advance request, so you can choose from our wider menu even when a meal is not being served today. The restaurant will confirm availability, pricing and preparation for your requested date.
            </p>

            {menuError && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#B9472E]/20 bg-[#B9472E]/10 px-4 py-3">

                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-[#B9472E]"
                />

                <p className="text-sm font-bold leading-6 text-[#B9472E]">
                  {menuError}
                </p>

              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">

              <div className="relative flex-1">

                <select
                  value={
                    selectedMenuItemId
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedMenuItemId(
                      event.target.value
                    )
                  }
                  disabled={
                    menuLoading ||
                    menuOptions.length ===
                      0
                  }
                  className="w-full appearance-none rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 pr-11 text-sm font-semibold text-[#321B29] outline-none focus:border-[#D89A27] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <option value="">
                    {menuLoading
                      ? "Loading menu..."
                      : menuOptions.length ===
                          0
                        ? "No menu foods available"
                        : "Select a food from the menu"}
                  </option>

                  {menuOptions.map(
                    (item) => (
                      <option
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {item.name}
                      </option>
                    )
                  )}

                </select>

                {menuLoading ? (
                  <Loader2 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#321B29]" />
                ) : (
                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#321B29]"
                  />
                )}

              </div>

              <button
                type="button"
                onClick={
                  addMenuItem
                }
                disabled={
                  !selectedMenuItemId
                }
                className="are-catering-add flex items-center justify-center gap-2 rounded-xl bg-[#321B29] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus
                  size={16}
                />

                Add
              </button>

            </div>

            {selectedMenuItems.length >
              0 && (
              <div className="mt-5 rounded-[18px] border border-[#321B29]/10 bg-[#FFF8EC] p-4">

                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#151313]/45">
                  Selected Food
                </p>

                <div className="mt-3 flex flex-wrap gap-2">

                  {selectedMenuItems.map(
                    (name) => (
                      <div
                        key={
                          name
                        }
                        className="flex items-center gap-2 rounded-full bg-[#321B29] py-2 pl-3.5 pr-2 text-xs font-bold text-white"
                      >

                        <span>
                          {name}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            removeMenuItem(
                              name
                            )
                          }
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 transition hover:bg-[#B9472E]"
                          aria-label={`Remove ${name}`}
                        >
                          <X
                            size={12}
                          />
                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          </div>

          <div className="mt-7">

            <label
              htmlFor="additionalFood"
              className="block font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]"
            >
              Additional Food or Special Request
            </label>

            <p className="mt-1 text-sm font-semibold leading-6 text-[#151313]/50">
              Want something else that you did not select above? Type it here and the restaurant can confirm whether it can be prepared.
            </p>

            <textarea
              id="additionalFood"
              name="additionalFood"
              rows={4}
              placeholder="Example: I would also like grilled chicken, extra salad, a custom tray, or another dish..."
              className="no-scrollbar mt-4 w-full resize-none rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-[#D89A27]"
            />

          </div>

          <div className="mt-6">

            <label
              htmlFor="notes"
              className="block font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]"
            >
              Additional Notes
            </label>

            <p className="mt-1 text-sm font-semibold text-[#151313]/50">
              Dietary requirements, allergies, service instructions or anything else the restaurant should know.
            </p>

            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Anything else we should know?"
              className="no-scrollbar mt-4 w-full resize-none rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-[#D89A27]"
            />

          </div>

          <button
            type="submit"
            className="are-catering-submit mt-7 w-full rounded-xl bg-[#321B29] px-6 py-4 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"
          >
            Review Request
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

        </form>

      </div>

    </section>
  );
}

type FieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
};

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
}: FieldProps) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-[#321B29]"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required={
          required
        }
        placeholder={
          placeholder
        }
        className="w-full rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3 text-sm font-semibold text-[#321B29] outline-none transition focus:border-[#D89A27]"
      />

    </div>
  );
}

function ReviewBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#FFF8EC] p-4">

      <p className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#151313]/40">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap break-words font-bold leading-6 text-[#321B29]">
        {value}
      </p>

    </div>
  );
}








