"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Gift,
  Loader2,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Search,
  ShoppingBag,
  UserRound,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import {
  auth,
  db,
} from "@/lib/firebase/client";
import { useAdminAuthorization } from "@/components/admin/AdminGuard";

type NotificationStatus = {
  restaurantEmail?: string;
  customerEmail?: string;
  whatsapp?: string;
};

type OrderAddOn = {
  name: string;
  price: number;
};

type OrderItem = {
  menuItemId: string;
  name: string;
  estonianName?: string;
  size: {
    label: string;
    price: number;
  };
  addOns: OrderAddOn[];
  quantity: number;
  unitTotal: number;
  lineTotal: number;
};

type Customer = {
  name: string;
  phone: string;
  email: string;
};

type Delivery = {
  address?: string;
  city?: string;
  postalCode?: string;
  orderingForSomeoneElse?: boolean;
  recipientName?: string;
  recipientPhone?: string;
};

type FoodOrder = {
  id: string;
  reference: string;
  status: string;
  source?: string;
  fulfilment: "pickup" | "delivery";
  customer: Customer;
  delivery?: Delivery | null;
  notes?: string | null;
  items: OrderItem[];
  currency: string;
  subtotal: number;
  deliveryCharge?: number | null;
  total: number;
  notificationStatus?: NotificationStatus;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

type CateringRecipient = {
  name?: string;
  phone?: string;
  giftMessage?: string | null;
};

type CateringRequest = {
  id: string;
  reference: string;
  status: string;
  source?: string;
  serviceType:
    | "corporate"
    | "event"
    | "gift-box";
  customer: Customer;
  companyName?: string;
  eventType?: string;
  requestedDate?: string;
  location?: string;
  guestCount?: number;
  budget?: string;
  recipient?: CateringRecipient;
  selectedMenuItems?: string[];
  additionalFood?: string | null;
  notes?: string | null;
  notificationStatus?: NotificationStatus;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

type Tab =
  | "orders"
  | "catering"
  | "gift-box";

const ORDER_STATUSES = [
  {
    value: "pending_confirmation",
    label: "Pending Confirmation",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "preparing",
    label: "Preparing",
  },
  {
    value: "ready",
    label: "Ready",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

const REQUEST_STATUSES = [
  {
    value: "pending_confirmation",
    label: "Pending Confirmation",
  },
  {
    value: "contacted",
    label: "Contacted",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "declined",
    label: "Declined",
  },
];

function timestampValue(
  value?: Timestamp | null
) {
  if (
    !value ||
    typeof value.toDate !== "function"
  ) {
    return 0;
  }

  return value.toDate().getTime();
}

function formatTimestamp(
  value?: Timestamp | null
) {
  if (
    !value ||
    typeof value.toDate !== "function"
  ) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(value.toDate());
}

function formatMoney(
  value: number,
  currency = "EUR"
) {
  return new Intl.NumberFormat(
    "en-IE",
    {
      style: "currency",
      currency,
    }
  ).format(
    Number.isFinite(value)
      ? value
      : 0
  );
}

function statusLabel(status: string) {
  const match = [
    ...ORDER_STATUSES,
    ...REQUEST_STATUSES,
  ].find(
    (item) =>
      item.value === status
  );

  if (match) {
    return match.label;
  }

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function serviceLabel(
  serviceType: CateringRequest["serviceType"]
) {
  if (serviceType === "corporate") {
    return "Corporate Catering";
  }

  if (serviceType === "event") {
    return "Event Catering";
  }

  return "Food Gift Box";
}

function statusClasses(status: string) {
  if (
    status === "completed" ||
    status === "ready"
  ) {
    return "bg-green-50 text-green-700 border-green-200";
  }

  if (
    status === "confirmed" ||
    status === "contacted" ||
    status === "preparing"
  ) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (
    status === "cancelled" ||
    status === "declined"
  ) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-[#D89A27]/10 text-[#8A5A00] border-[#D89A27]/25";
}

export default function AdminOrders() {
  const router = useRouter();
  const { hasPermission } = useAdminAuthorization();
  const canOrders = hasPermission("manageOrders");
  const canCatering = hasPermission("manageCatering");

  const [
    authorized,
    setAuthorized,
  ] = useState(false);

  const [
    checkingAdmin,
    setCheckingAdmin,
  ] = useState(true);

  const [
    loadingData,
    setLoadingData,
  ] = useState(true);

  const [
    orders,
    setOrders,
  ] = useState<FoodOrder[]>([]);

  const [
    requests,
    setRequests,
  ] = useState<CateringRequest[]>([]);

  const [
    tab,
    setTab,
  ] = useState<Tab>(() => {
    if (typeof window === "undefined") return "orders";
    const hash = window.location.hash.replace("#", "");
    return hash === "catering" || hash === "gift-box" ? hash : "orders";
  });

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    expandedId,
    setExpandedId,
  ] = useState<string | null>(
    null
  );

  const [
    savingId,
    setSavingId,
  ] = useState<string | null>(
    null
  );

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            router.replace(
              "/login"
            );

            return;
          }

          try {
            const adminSnapshot =
              await getDoc(
                doc(
                  db,
                  "admins",
                  user.uid
                )
              );

            if (
              !adminSnapshot.exists()
            ) {
              await signOut(auth);

              router.replace(
                "/login"
              );

              return;
            }

            const adminData =
              adminSnapshot.data();

            if (
              adminData.role !== "admin" &&
              adminData.role !== "owner" ||
              adminData.active !==
                true
            ) {
              await signOut(auth);

              router.replace(
                "/login"
              );

              return;
            }

            setAuthorized(true);
            setCheckingAdmin(false);
          } catch (authError) {
            console.error(
              "Orders admin verification error:",
              authError
            );

            setError(
              "Unable to verify administrator access."
            );

            setCheckingAdmin(false);
          }
        }
      );

    return () => {
      unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!authorized) {
      return;
    }

    let ordersLoaded = false;
    let requestsLoaded = false;

    function finishLoading() {
      if (
        ordersLoaded &&
        requestsLoaded
      ) {
        setLoadingData(false);
      }
    }

    const unsubscribeOrders = canOrders ? onSnapshot(
        collection(db, "orders"),
        (snapshot) => {
          const nextOrders =
            snapshot.docs
              .map((orderDocument) => {
                const data =
                  orderDocument.data();

                return {
                  id: orderDocument.id,
                  ...data,
                } as FoodOrder;
              })
              .sort(
                (first, second) =>
                  timestampValue(
                    second.createdAt
                  ) -
                  timestampValue(
                    first.createdAt
                  )
              );

          setOrders(nextOrders);

          ordersLoaded = true;
          finishLoading();
        },
        (snapshotError) => {
          console.error(
            "Orders listener error:",
            snapshotError
          );

          setError(
            "Unable to load customer orders."
          );

          ordersLoaded = true;
          finishLoading();
        }
      ) : () => { ordersLoaded = true; finishLoading(); };

    const unsubscribeRequests = canCatering ? onSnapshot(
        collection(
          db,
          "cateringRequests"
        ),
        (snapshot) => {
          const nextRequests =
            snapshot.docs
              .map(
                (requestDocument) => {
                  const data =
                    requestDocument.data();

                  return {
                    id:
                      requestDocument.id,
                    ...data,
                  } as CateringRequest;
                }
              )
              .sort(
                (first, second) =>
                  timestampValue(
                    second.createdAt
                  ) -
                  timestampValue(
                    first.createdAt
                  )
              );

          setRequests(nextRequests);

          requestsLoaded = true;
          finishLoading();
        },
        (snapshotError) => {
          console.error(
            "Catering listener error:",
            snapshotError
          );

          setError(
            "Unable to load catering requests."
          );

          requestsLoaded = true;
          finishLoading();
        }
      ) : () => { requestsLoaded = true; finishLoading(); };

    return () => {
      unsubscribeOrders();
      unsubscribeRequests();
    };
  }, [authorized, canCatering, canOrders]);

  const activeTab = !canOrders && canCatering ? "catering" : tab;

  const cateringRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            request.serviceType !==
            "gift-box"
        ),
      [requests]
    );

  const giftBoxRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            request.serviceType ===
            "gift-box"
        ),
      [requests]
    );

  const filteredOrders =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      if (!term) {
        return orders;
      }

      return orders.filter(
        (order) =>
          order.reference
            ?.toLowerCase()
            .includes(term) ||
          order.customer?.name
            ?.toLowerCase()
            .includes(term) ||
          order.customer?.phone
            ?.toLowerCase()
            .includes(term) ||
          order.customer?.email
            ?.toLowerCase()
            .includes(term) ||
          order.items?.some(
            (item) =>
              item.name
                ?.toLowerCase()
                .includes(term)
          )
      );
    }, [orders, search]);

  const filteredCatering =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      if (!term) {
        return cateringRequests;
      }

      return cateringRequests.filter(
        (request) =>
          request.reference
            ?.toLowerCase()
            .includes(term) ||
          request.customer?.name
            ?.toLowerCase()
            .includes(term) ||
          request.customer?.phone
            ?.toLowerCase()
            .includes(term) ||
          request.customer?.email
            ?.toLowerCase()
            .includes(term) ||
          request.companyName
            ?.toLowerCase()
            .includes(term) ||
          request.eventType
            ?.toLowerCase()
            .includes(term) ||
          request.selectedMenuItems?.some(
            (item) =>
              item
                .toLowerCase()
                .includes(term)
          )
      );
    }, [
      cateringRequests,
      search,
    ]);

  const filteredGiftBoxes =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      if (!term) {
        return giftBoxRequests;
      }

      return giftBoxRequests.filter(
        (request) =>
          request.reference
            ?.toLowerCase()
            .includes(term) ||
          request.customer?.name
            ?.toLowerCase()
            .includes(term) ||
          request.customer?.phone
            ?.toLowerCase()
            .includes(term) ||
          request.recipient?.name
            ?.toLowerCase()
            .includes(term) ||
          request.recipient?.phone
            ?.toLowerCase()
            .includes(term) ||
          request.selectedMenuItems?.some(
            (item) =>
              item
                .toLowerCase()
                .includes(term)
          )
      );
    }, [
      giftBoxRequests,
      search,
    ]);

  async function updateStatus(
    collectionName:
      | "orders"
      | "cateringRequests",
    documentId: string,
    status: string
  ) {
    if ((collectionName === "orders" && !canOrders) || (collectionName === "cateringRequests" && !canCatering)) {
      setError("You do not have permission to update this request.");
      return;
    }
    setError("");
    setSavingId(documentId);

    try {
      if (collectionName === "orders") {
        if (status === "completed" && !window.confirm("Mark this order as completed? This status cannot be changed afterward.")) {
          setSavingId(null);
          return;
        }

        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : "";
        const response = await fetch("/api/admin/orders/status", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId: documentId, status }),
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error || "The order status could not be updated.");
      } else {
        await updateDoc(
          doc(db, collectionName, documentId),
          { status, updatedAt: serverTimestamp() }
        );
      }
    } catch (updateError) {
      console.error(
        "Status update error:",
        updateError
      );

      setError(
        "The status could not be updated. Please try again."
      );
    } finally {
      setSavingId(null);
    }
  }

  function toggleExpanded(
    id: string
  ) {
    setExpandedId(
      (current) =>
        current === id
          ? null
          : id
    );
  }

  if (
    checkingAdmin ||
    loadingData
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8EC]">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#321B29]" />

          <p className="mt-4 text-sm font-bold text-[#321B29]/60">
            Loading orders and requests...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8EC] text-[#151313]">
      <header className="sticky top-0 z-30 border-b border-[#321B29]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-5 py-5 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() =>
              router.push("/admin")
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#321B29]/10 text-[#321B29] transition hover:bg-[#321B29] hover:text-white"
            aria-label="Back to admin dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#B9472E]">
              African Restaurant Estonia
            </p>

            <h1 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
              Orders & Requests
            </h1>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-12">
        <div className="overflow-hidden rounded-[28px] bg-[#321B29] p-6 text-white sm:p-8">
          <div className="grid min-w-0 gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <ShoppingBag
                size={25}
                className="text-[#D89A27]"
              />

              <h2 className="mt-4 font-[var(--font-cormorant)] text-4xl font-bold sm:text-5xl">
                Customer activity in one place.
              </h2>

              <p className="mt-3 max-w-[720px] text-sm font-semibold leading-7 text-white/60">
                Review food orders, catering enquiries, event requests and gift box requests as they arrive.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-3 gap-2">
              {canOrders && <SummaryBox
                label="Orders"
                value={orders.length}
              />}

              {canCatering && <SummaryBox
                label="Catering"
                value={
                  cateringRequests.length
                }
              />}

              {canCatering && <SummaryBox
                label="Gift Boxes"
                value={
                  giftBoxRequests.length
                }
              />}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-[#B9472E]/20 bg-[#B9472E]/10 p-4 text-sm font-bold text-[#B9472E]">
            {error}
          </div>
        )}

        <div className="mt-7 rounded-[24px] border border-[#321B29]/10 bg-white p-4 shadow-[0_8px_30px_rgba(50,27,41,0.04)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {canOrders && <TabButton
                active={
                  activeTab === "orders"
                }
                label={`Food Orders (${orders.length})`}
                onClick={() => {
                  setTab("orders");
                  setExpandedId(null);
                }}
              />}

              {canCatering && <TabButton
                active={
                  activeTab === "catering"
                }
                label={`Catering & Events (${cateringRequests.length})`}
                onClick={() => {
                  setTab("catering");
                  setExpandedId(null);
                }}
              />}

              {canCatering && <TabButton
                active={
                  activeTab === "gift-box"
                }
                label={`Gift Boxes (${giftBoxRequests.length})`}
                onClick={() => {
                  setTab("gift-box");
                  setExpandedId(null);
                }}
              />}
            </div>

            <div className="relative w-full lg:max-w-[360px]">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#321B29]/35"
              />

              <input
                type="search"
                aria-label="Search orders and requests"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search reference, customer or food..."
                className="w-full rounded-xl border border-[#321B29]/10 bg-[#FFF8EC] py-3 pl-11 pr-4 text-sm font-semibold text-[#321B29] outline-none transition placeholder:text-[#321B29]/35 focus:border-[#D89A27]"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {activeTab === "orders" &&
            filteredOrders.map(
              (order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  expanded={
                    expandedId ===
                    order.id
                  }
                  saving={
                    savingId ===
                    order.id
                  }
                  onToggle={() =>
                    toggleExpanded(
                      order.id
                    )
                  }
                  onStatusChange={(
                    status
                  ) =>
                    updateStatus(
                      "orders",
                      order.id,
                      status
                    )
                  }
                />
              )
            )}

          {activeTab === "catering" &&
            filteredCatering.map(
              (request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  expanded={
                    expandedId ===
                    request.id
                  }
                  saving={
                    savingId ===
                    request.id
                  }
                  onToggle={() =>
                    toggleExpanded(
                      request.id
                    )
                  }
                  onStatusChange={(
                    status
                  ) =>
                    updateStatus(
                      "cateringRequests",
                      request.id,
                      status
                    )
                  }
                />
              )
            )}

          {activeTab === "gift-box" &&
            filteredGiftBoxes.map(
              (request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  expanded={
                    expandedId ===
                    request.id
                  }
                  saving={
                    savingId ===
                    request.id
                  }
                  onToggle={() =>
                    toggleExpanded(
                      request.id
                    )
                  }
                  onStatusChange={(
                    status
                  ) =>
                    updateStatus(
                      "cateringRequests",
                      request.id,
                      status
                    )
                  }
                />
              )
            )}

          {activeTab === "orders" &&
            filteredOrders.length ===
              0 && (
              <EmptyState
                title="No food orders found"
                description="New website orders will appear here automatically."
              />
            )}

          {activeTab === "catering" &&
            filteredCatering.length ===
              0 && (
              <EmptyState
                title="No catering requests found"
                description="Corporate and event requests will appear here automatically."
              />
            )}

          {activeTab === "gift-box" &&
            filteredGiftBoxes.length ===
              0 && (
              <EmptyState
                title="No gift box requests found"
                description="Food gift box requests will appear here automatically."
              />
            )}
        </div>
      </section>
    </main>
  );
}

function SummaryBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-[95px] rounded-2xl border border-white/10 bg-white/10 p-3 text-center">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/45">
        {label}
      </p>

      <p className="mt-1 font-[var(--font-cormorant)] text-3xl font-bold text-[#D89A27]">
        {value}
      </p>
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-3 text-xs font-extrabold transition ${
        active
          ? "bg-[#321B29] text-white"
          : "border border-[#321B29]/10 bg-[#FFF8EC] text-[#321B29] hover:border-[#D89A27]"
      }`}
    >
      {label}
    </button>
  );
}

function OrderCard({
  order,
  expanded,
  saving,
  onToggle,
  onStatusChange,
}: {
  order: FoodOrder;
  expanded: boolean;
  saving: boolean;
  onToggle: () => void;
  onStatusChange: (
    status: string
  ) => void;
}) {
  return (
    <article className="overflow-hidden rounded-[22px] border border-[#321B29]/10 bg-white shadow-[0_6px_24px_rgba(50,27,41,0.04)]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#321B29] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                Food Order
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] ${statusClasses(
                  order.status
                )}`}
              >
                {statusLabel(
                  order.status
                )}
              </span>
            </div>

            <h2 className="mt-3 break-all font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
              {order.reference}
            </h2>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#151313]/55">
              <span className="flex items-center gap-1.5">
                <UserRound size={14} />
                {order.customer?.name}
              </span>

              <span className="flex items-center gap-1.5">
                <CalendarDays
                  size={14}
                />
                {formatTimestamp(
                  order.createdAt
                )}
              </span>

              <span className="flex items-center gap-1.5 capitalize">
                <PackageCheck
                  size={14}
                />
                {order.fulfilment}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="sm:text-right">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#151313]/35">
                Total
              </p>

              <p className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
                {formatMoney(
                  order.total,
                  order.currency
                )}
              </p>
            </div>

            <select
              aria-label={`Update status for ${order.reference}`}
              value={order.status}
              disabled={saving || order.status === "completed"}
              onChange={(event) =>
                onStatusChange(
                  event.target.value
                )
              }
              className="rounded-xl border border-[#321B29]/10 bg-[#FFF8EC] px-3 py-3 text-xs font-extrabold text-[#321B29] outline-none focus:border-[#D89A27] disabled:opacity-50"
            >
              {ORDER_STATUSES.map(
                (status) => (
                  <option
                    key={
                      status.value
                    }
                    value={
                      status.value
                    }
                  >
                    {status.label}
                  </option>
                )
              )}
            </select>

            {order.status === "completed" && (
              <p className="max-w-[170px] text-[10px] font-bold leading-4 text-green-700">
                Completed orders are final.
              </p>
            )}

            <button
              type="button"
              onClick={onToggle}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#321B29]/10 px-4 text-xs font-extrabold text-[#321B29] transition hover:bg-[#FFF8EC]"
            >
              {expanded
                ? "Hide Details"
                : "View Details"}

              {expanded ? (
                <ChevronUp
                  size={16}
                />
              ) : (
                <ChevronDown
                  size={16}
                />
              )}
            </button>
          </div>
        </div>

        {saving && (
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#B9472E]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating status...
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-[#321B29]/10 bg-[#FFFDF9] p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <DetailSection title="Customer">
              <DetailLine
                icon={UserRound}
                label="Name"
                value={
                  order.customer?.name
                }
              />

              <DetailLine
                icon={Phone}
                label="Phone"
                value={
                  order.customer?.phone
                }
              />

              <DetailLine
                icon={Mail}
                label="Email"
                value={
                  order.customer?.email
                }
              />
            </DetailSection>

            <DetailSection title="Fulfilment">
              <DetailLine
                icon={PackageCheck}
                label="Method"
                value={
                  order.fulfilment ===
                  "delivery"
                    ? "Delivery"
                    : "Pickup"
                }
              />

              {order.delivery && (
                <>
                  <DetailLine
                    icon={MapPin}
                    label="Address"
                    value={[
                      order.delivery
                        .address,
                      order.delivery.city,
                      order.delivery
                        .postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  />

                  {order.delivery
                    .orderingForSomeoneElse && (
                    <>
                      <DetailLine
                        icon={
                          UserRound
                        }
                        label="Recipient"
                        value={
                          order
                            .delivery
                            .recipientName
                        }
                      />

                      <DetailLine
                        icon={Phone}
                        label="Recipient Phone"
                        value={
                          order
                            .delivery
                            .recipientPhone
                        }
                      />
                    </>
                  )}
                </>
              )}
            </DetailSection>
          </div>

          <div className="mt-5 rounded-2xl border border-[#321B29]/10 bg-white p-5">
            <div className="flex items-center gap-2">
              <UtensilsCrossed
                size={18}
                className="text-[#B9472E]"
              />

              <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                Order Items
              </h3>
            </div>

            <div className="mt-4 divide-y divide-[#321B29]/10">
              {(order.items ?? []).map(
                (item, index) => (
                  <div
                    key={`${item.menuItemId}-${index}`}
                    className="py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-[#321B29]">
                          {item.quantity} ×{" "}
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#151313]/50">
                          {item.size?.label} —{" "}
                          {formatMoney(
                            item.size
                              ?.price ??
                              0,
                            order.currency
                          )}
                        </p>

                        {item.addOns
                          ?.length >
                          0 && (
                          <p className="mt-1 text-xs font-semibold leading-5 text-[#151313]/50">
                            Add-ons:{" "}
                            {item.addOns
                              .map(
                                (
                                  addOn
                                ) =>
                                  `${addOn.name} (${formatMoney(
                                    addOn.price,
                                    order.currency
                                  )})`
                              )
                              .join(
                                ", "
                              )}
                          </p>
                        )}
                      </div>

                      <p className="shrink-0 font-extrabold text-[#321B29]">
                        {formatMoney(
                          item.lineTotal,
                          order.currency
                        )}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-5 border-t border-[#321B29]/10 pt-4">
              <div className="flex items-center justify-between text-sm font-bold text-[#321B29]">
                <span>Subtotal</span>
                <span>
                  {formatMoney(
                    order.subtotal,
                    order.currency
                  )}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between font-extrabold text-[#321B29]">
                <span>Total</span>
                <span className="text-lg">
                  {formatMoney(
                    order.total,
                    order.currency
                  )}
                </span>
              </div>
            </div>
          </div>

          {order.notes && (
            <TextBox
              title="Customer Notes"
              value={order.notes}
            />
          )}

          <NotificationBox
            status={
              order.notificationStatus
            }
          />
        </div>
      )}
    </article>
  );
}

function RequestCard({
  request,
  expanded,
  saving,
  onToggle,
  onStatusChange,
}: {
  request: CateringRequest;
  expanded: boolean;
  saving: boolean;
  onToggle: () => void;
  onStatusChange: (
    status: string
  ) => void;
}) {
  return (
    <article className="overflow-hidden rounded-[22px] border border-[#321B29]/10 bg-white shadow-[0_6px_24px_rgba(50,27,41,0.04)]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#321B29] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                {serviceLabel(
                  request.serviceType
                )}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] ${statusClasses(
                  request.status
                )}`}
              >
                {statusLabel(
                  request.status
                )}
              </span>
            </div>

            <h2 className="mt-3 break-all font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
              {request.reference}
            </h2>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#151313]/55">
              <span className="flex items-center gap-1.5">
                <UserRound size={14} />
                {request.customer?.name}
              </span>

              <span className="flex items-center gap-1.5">
                <CalendarDays
                  size={14}
                />
                Submitted{" "}
                {formatTimestamp(
                  request.createdAt
                )}
              </span>

              {request.requestedDate && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays
                    size={14}
                  />
                  Requested{" "}
                  {request.requestedDate}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            aria-label={`Update status for ${request.id}`}
            value={request.status}
              disabled={saving}
              onChange={(event) =>
                onStatusChange(
                  event.target.value
                )
              }
              className="rounded-xl border border-[#321B29]/10 bg-[#FFF8EC] px-3 py-3 text-xs font-extrabold text-[#321B29] outline-none focus:border-[#D89A27] disabled:opacity-50"
            >
              {REQUEST_STATUSES.map(
                (status) => (
                  <option
                    key={
                      status.value
                    }
                    value={
                      status.value
                    }
                  >
                    {status.label}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={onToggle}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#321B29]/10 px-4 text-xs font-extrabold text-[#321B29] transition hover:bg-[#FFF8EC]"
            >
              {expanded
                ? "Hide Details"
                : "View Details"}

              {expanded ? (
                <ChevronUp
                  size={16}
                />
              ) : (
                <ChevronDown
                  size={16}
                />
              )}
            </button>
          </div>
        </div>

        {saving && (
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#B9472E]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating status...
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-[#321B29]/10 bg-[#FFFDF9] p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <DetailSection title="Customer">
              <DetailLine
                icon={UserRound}
                label="Name"
                value={
                  request.customer?.name
                }
              />

              <DetailLine
                icon={Phone}
                label="Phone"
                value={
                  request.customer?.phone
                }
              />

              <DetailLine
                icon={Mail}
                label="Email"
                value={
                  request.customer?.email
                }
              />

              {request.companyName && (
                <DetailLine
                  icon={Users}
                  label="Company"
                  value={
                    request.companyName
                  }
                />
              )}
            </DetailSection>

            <DetailSection title="Request">
              <DetailLine
                icon={CalendarDays}
                label="Requested Date"
                value={
                  request.requestedDate
                }
              />

              <DetailLine
                icon={MapPin}
                label="Location"
                value={
                  request.location
                }
              />

              {request.eventType && (
                <DetailLine
                  icon={
                    UtensilsCrossed
                  }
                  label="Event Type"
                  value={
                    request.eventType
                  }
                />
              )}

              {typeof request.guestCount ===
                "number" && (
                <DetailLine
                  icon={Users}
                  label="Guests"
                  value={String(
                    request.guestCount
                  )}
                />
              )}

              {request.budget && (
                <DetailLine
                  icon={
                    CircleDollarSign
                  }
                  label="Budget"
                  value={
                    request.budget
                  }
                />
              )}
            </DetailSection>
          </div>

          {request.serviceType ===
            "gift-box" &&
            request.recipient && (
              <div className="mt-5">
                <DetailSection title="Gift Recipient">
                  <DetailLine
                    icon={Gift}
                    label="Recipient"
                    value={
                      request.recipient
                        .name
                    }
                  />

                  <DetailLine
                    icon={Phone}
                    label="Recipient Phone"
                    value={
                      request.recipient
                        .phone
                    }
                  />

                  {request.recipient
                    .giftMessage && (
                    <DetailLine
                      icon={Mail}
                      label="Gift Message"
                      value={
                        request
                          .recipient
                          .giftMessage
                      }
                    />
                  )}
                </DetailSection>
              </div>
            )}

          <div className="mt-5 rounded-2xl border border-[#321B29]/10 bg-white p-5">
            <div className="flex items-center gap-2">
              <UtensilsCrossed
                size={18}
                className="text-[#B9472E]"
              />

              <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                Food Selection
              </h3>
            </div>

            {request.selectedMenuItems &&
            request.selectedMenuItems
              .length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {request.selectedMenuItems.map(
                  (item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="rounded-full bg-[#FFF8EC] px-3 py-2 text-xs font-bold text-[#321B29]"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold text-[#151313]/45">
                No menu items selected.
              </p>
            )}

            {request.additionalFood && (
              <div className="mt-4 border-t border-[#321B29]/10 pt-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#B9472E]">
                  Additional Food Request
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-[#321B29]">
                  {request.additionalFood}
                </p>
              </div>
            )}
          </div>

          {request.notes && (
            <TextBox
              title="Customer Notes"
              value={request.notes}
            />
          )}

          <NotificationBox
            status={
              request.notificationStatus
            }
          />
        </div>
      )}
    </article>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#321B29]/10 bg-white p-5">
      <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
        {title}
      </h3>

      <div className="mt-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

function DetailLine({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  label: string;
  value?: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex items-start gap-3">
      <Icon
        size={16}
        className="mt-0.5 shrink-0 text-[#B9472E]"
      />

      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#151313]/35">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-bold text-[#321B29]">
          {value}
        </p>
      </div>
    </div>
  );
}

function TextBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-[#D89A27]/25 bg-[#D89A27]/10 p-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#B9472E]">
        {title}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#321B29]">
        {value}
      </p>
    </div>
  );
}

function NotificationBox({
  status,
}: {
  status?: NotificationStatus;
}) {
  if (!status) {
    return null;
  }

  return (
    <div className="mt-5 rounded-2xl border border-[#321B29]/10 bg-white p-5">
      <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
        Notifications
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <NotificationItem
          label="Restaurant Email"
          value={
            status.restaurantEmail ??
            "unknown"
          }
        />

        <NotificationItem
          label="Customer Email"
          value={
            status.customerEmail ??
            "unknown"
          }
        />

        <NotificationItem
          label="WhatsApp"
          value={
            status.whatsapp ??
            "pending"
          }
        />
      </div>
    </div>
  );
}

function NotificationItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const sent =
    value === "sent" ||
    value === "opened";

  return (
    <div className="rounded-xl bg-[#FFF8EC] p-4">
      <div className="flex items-center gap-2">
        <CheckCircle2
          size={15}
          className={
            sent
              ? "text-green-700"
              : "text-[#D89A27]"
          }
        />

        <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#151313]/40">
          {label}
        </p>
      </div>

      <p className="mt-2 text-xs font-extrabold capitalize text-[#321B29]">
        {value.replaceAll(
          "_",
          " "
        )}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-[#321B29]/15 bg-white p-10 text-center">
      <ShoppingBag
        size={30}
        className="mx-auto text-[#321B29]/25"
      />

      <h3 className="mt-4 font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-[460px] text-sm font-semibold leading-6 text-[#151313]/45">
        {description}
      </p>
    </div>
  );
}
