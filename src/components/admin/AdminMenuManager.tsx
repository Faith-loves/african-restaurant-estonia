"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";

import {
  useRouter,
} from "next/navigation";

import {
  Archive,
  ArrowLeft,
  ChefHat,
  Edit3,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import { db } from "@/lib/firebase/client";

import {
  legacyDuplicateComboIds,
  isHiddenMenuCategory,
  menuItems as catalogMenuItems,
  menuImageById,
} from "@/data/menuData";

import AdminFoodForm, {
  AdminFoodItem,
} from "@/components/admin/AdminFoodForm";
import MenuItemImage from "@/components/menu/MenuItemImage";
import { useAdminAuth } from "@/context/AdminAuthContext";

const catalogComboIds = new Set(
  catalogMenuItems
    .filter((item) => item.category === "COMBO OPTIONS")
    .map((item) => item.id)
);

const MENU_LOAD_TIMEOUT_MS = 10_000;

function sortMenuItems(items: AdminFoodItem[]) {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

function getInitialMenuItems() {
  return sortMenuItems(
    catalogMenuItems
      .filter((item) => !isHiddenMenuCategory(item.category))
      .map((item) => ({ ...item }))
  );
}

function mergeMenuSnapshot(snapshot: QuerySnapshot<DocumentData>) {
  const recordsById = new Map<string, AdminFoodItem>(
    getInitialMenuItems().map((item) => [item.id, item])
  );

  snapshot.docs
    .filter((menuDocument) => {
      const category = menuDocument.data().category;

      return (
        !isHiddenMenuCategory(category) &&
        !legacyDuplicateComboIds.includes(
          menuDocument.id as (typeof legacyDuplicateComboIds)[number]
        ) &&
        (category !== "COMBO OPTIONS" || catalogComboIds.has(menuDocument.id))
      );
    })
    .forEach((menuDocument) => {
      const data = menuDocument.data();
      const remoteTags = Array.isArray(data.tags)
        ? data.tags.filter(
            (tag) =>
              !((menuDocument.id === "jollof-rice" || menuDocument.id === "fried-rice") && tag === "VEGAN OPTIONS")
          )
        : data.tags;

      recordsById.set(menuDocument.id, {
        id: menuDocument.id,
        ...data,
        tags: remoteTags,
        image:
          menuDocument.id === "puff-puff" || menuDocument.id === "abula" || menuDocument.id === "jollof-rice" || menuDocument.id === "fried-rice" || menuDocument.id === "combo-peppered-fish-plantain-zobo-13"
            ? menuImageById[menuDocument.id]
            : data.image || menuImageById[menuDocument.id],
      } as unknown as AdminFoodItem);
    });

  return sortMenuItems(Array.from(recordsById.values()));
}

export default function AdminMenuManager() {
  const router =
    useRouter();

  const { loading: adminLoading } = useAdminAuth();
  const checkingAdmin = adminLoading;

  const [
    syncingMenu,
    setSyncingMenu,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    syncError,
    setSyncError,
  ] = useState("");

  const [
    menuSyncAttempt,
    setMenuSyncAttempt,
  ] = useState(0);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    showArchived,
    setShowArchived,
  ] = useState(false);

  const [
    items,
    setItems,
  ] = useState<AdminFoodItem[]>(getInitialMenuItems);

  const [
    editingItem,
    setEditingItem,
  ] = useState<
    AdminFoodItem | null
  >(null);

  const [
    addingFood,
    setAddingFood,
  ] = useState(false);

  useEffect(() => {
    if (checkingAdmin) {
      return;
    }

    let active = true;
    let initialLoadSettled = false;
    let unsubscribe = () => {};

    const clearLoadTimeout = () => {
      window.clearTimeout(timeoutId);
    };

    const finishWithError = (message: string) => {
      if (!active) {
        return;
      }

      active = false;
      initialLoadSettled = true;
      clearLoadTimeout();
      unsubscribe();
      setSyncError(message);
      setSyncingMenu(false);
    };

    const timeoutId = window.setTimeout(() => {
      finishWithError(
        "Live menu data could not be synced. Retry connection."
      );
    }, MENU_LOAD_TIMEOUT_MS);

    try {
      unsubscribe = onSnapshot(
        collection(
          db,
          "menuItems"
        ),
        (snapshot) => {
          if (!active) {
            return;
          }

          if (!initialLoadSettled) {
            initialLoadSettled = true;
            clearLoadTimeout();
          }
          setItems(mergeMenuSnapshot(snapshot));
          setSyncError("");
          setSyncingMenu(false);
        },
        (snapshotError) => {
          console.error(
            snapshotError
          );

          finishWithError(
            "Unable to load the menu from Firestore."
          );
        }
      );
    } catch (snapshotError) {
      console.error(
        snapshotError
      );

      finishWithError(
        "Unable to load the menu from Firestore."
      );
    }

    return () => {
      active = false;
      initialLoadSettled = true;
      clearLoadTimeout();
      unsubscribe();
    };
  }, [checkingAdmin, menuSyncAttempt]);

  const visibleItems =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return items.filter(
        (item) => {
          const archived =
            item.archived ===
            true;

          if (
            showArchived
              ? !archived
              : archived
          ) {
            return false;
          }

          if (!term) {
            return true;
          }

          return (
            item.name
              .toLowerCase()
              .includes(
                term
              ) ||
            (
              item.category ??
              ""
            )
              .toLowerCase()
              .includes(
                term
              )
          );
        }
      );
    }, [
      items,
      search,
      showArchived,
    ]);

  const activeItems =
    items.filter(
      (item) =>
        item.archived !==
        true
    );

  const archivedItems =
    items.filter(
      (item) =>
        item.archived ===
        true
    );

  async function toggleField(
    item: AdminFoodItem,
    field:
      | "available"
      | "isTodayMenu"
      | "isChefSpecial"
  ) {
    setError("");


    try {
      await setDoc(
        doc(
          db,
          "menuItems",
          item.id
        ),
        {
          [field]:
            item[field] !==
            true,

          updatedAt:
            serverTimestamp(),
        },
        { merge: true }
      );
    } catch (updateError) {
      console.error(
        updateError
      );

      setError(
        `Unable to update ${item.name}.`
      );
    }
  }

  async function toggleArchive(
    item: AdminFoodItem
  ) {
    setError("");

    const archiving =
      item.archived !== true;

    if (
      archiving &&
      !window.confirm(
        `Archive ${item.name}? It will be hidden from the customer menu once the public menu is connected to Firestore.`
      )
    ) {
      return;
    }

    try {
      await setDoc(
        doc(
          db,
          "menuItems",
          item.id
        ),
        {
          archived:
            archiving,

          available:
            archiving
              ? false
              : item.available ??
                false,

          isTodayMenu:
            archiving
              ? false
              : item.isTodayMenu ??
                false,

          updatedAt:
            serverTimestamp(),
        },
        { merge: true }
      );
    } catch (archiveError) {
      console.error(
        archiveError
      );

      setError(
        `Unable to ${
          archiving
            ? "archive"
            : "restore"
        } ${item.name}.`
      );
    }
  }

  if (checkingAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8EC]">

        <div className="text-center">

          <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#321B29]" />

          <p className="mt-4 text-sm font-bold text-[#321B29]/60">
            Loading Menu Management...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8EC]">

      <header className="border-b border-[#321B29]/10 bg-white">

        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin"
                )
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#321B29]/10 text-[#321B29] transition hover:bg-[#321B29] hover:text-white"
            >
              <ArrowLeft
                size={18}
              />
            </button>

            <div className="min-w-0">

              <p className="truncate text-xs font-extrabold uppercase tracking-[0.18em] text-[#B9472E]">
                African Restaurant Estonia
              </p>

              <h1 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
                Menu Management
              </h1>

            </div>

          </div>

          {syncingMenu && (
            <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#321B29]/10 bg-white px-4 py-3 text-sm font-bold text-[#321B29]/65">
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing menu…
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              setAddingFood(
                true
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#321B29] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"
          >
            <Plus
              size={17}
            />

            Add Food
          </button>

        </div>

      </header>

      <section className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-12">

        {syncError && (
          <div className="mb-6 rounded-2xl border border-[#D89A27]/40 bg-[#D89A27]/15 px-5 py-4 text-sm font-bold leading-6 text-[#321B29]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{syncError}</span>
              <button
                type="button"
                onClick={() => {
                  setSyncError("");
                  setSyncingMenu(true);
                  setMenuSyncAttempt((current) => current + 1);
                }}
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-[#321B29] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29]"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-[#B9472E]/20 bg-[#B9472E]/10 px-5 py-4 text-sm font-bold leading-6 text-[#B9472E]">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Active Foods"
            value={
              activeItems.length
            }
          />

          <StatCard
            label="Available"
            value={
              activeItems.filter(
                (item) =>
                  item.available ===
                  true
              ).length
            }
          />

          <StatCard
            label="Price Pending"
            value={
              activeItems.filter(
                (item) =>
                  item.pricePending ===
                  true
              ).length
            }
          />

          <StatCard
            label="Archived"
            value={
              archivedItems.length
            }
          />

        </div>

        <div className="mt-7 rounded-[24px] border border-[#321B29]/10 bg-white p-5 sm:p-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
                {showArchived
                  ? "Archived Foods"
                  : "Restaurant Menu"}
              </h2>

              <p className="mt-1 text-sm font-semibold text-[#151313]/50">
                Edit food information, prices, availability and menu features.
              </p>

            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">

              <button
                type="button"
                onClick={() =>
                  setShowArchived(
                    (current) =>
                      !current
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#321B29]/10 px-4 py-3 text-xs font-extrabold text-[#321B29]"
              >
                {showArchived ? (
                  <>
                    <UtensilsCrossed
                      size={15}
                    />
                    Active Menu
                  </>
                ) : (
                  <>
                    <Archive
                      size={15}
                    />
                    Archived
                  </>
                )}
              </button>

              <div className="relative min-w-0 sm:w-[300px]">

                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#321B29]/40"
                />

                <input
                  type="search"
                  aria-label="Search food menu"
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search food..."
                  className="admin-input pl-11"
                />

              </div>

            </div>

          </div>

          <div className="mt-6 space-y-3">

            {visibleItems.length ===
            0 ? (
              <div className="rounded-2xl bg-[#FFF8EC] px-5 py-10 text-center">

                <p className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                  No food found
                </p>

              </div>
            ) : (
              visibleItems.map(
                (item) => (
                  <article
                    key={
                      item.id
                    }
                    className={`rounded-2xl border border-[#321B29]/10 bg-[#FFF8EC] p-4 ${
                      item.archived
                        ? "opacity-65"
                        : ""
                    }`}
                  >

                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                      <div className="flex min-w-0 gap-4">

                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">

                          <MenuItemImage
                            name={item.name}
                            image={item.image}
                          />

                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                              {
                                item.name
                              }
                            </h3>

                            {item.pricePending && (
                              <span className="rounded-full bg-[#B9472E]/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#B9472E]">
                                Price Pending
                              </span>
                            )}

                            {item.archived && (
                              <span className="rounded-full bg-[#321B29]/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#321B29]">
                                Archived
                              </span>
                            )}

                          </div>

                          <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#321B29]/45">
                            {item.category ??
                              "Uncategorised"}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">

                            {item.sizes?.map(
                              (
                                size,
                                index
                              ) => (
                                <span
                                  key={`${item.id}-${index}`}
                                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#321B29]/65"
                                >
                                  {
                                    size.label
                                  }

                                  {typeof size.price ===
                                  "number"
                                    ? ` · €${size.price.toFixed(
                                        2
                                      )}`
                                    : " · Pending"}
                                </span>
                              )
                            )}

                          </div>

                        </div>

                      </div>

                      <div className="flex flex-wrap gap-2">

                        {!item.archived && (
                          <>
                            <SmallToggle
                              active={
                                item.available ===
                                true
                              }
                              disabled={false}
                              onClick={() =>
                                toggleField(
                                  item,
                                  "available"
                                )
                              }
                              label={
                                item.available
                                  ? "Available"
                                  : "Unavailable"
                              }
                              icon={
                                UtensilsCrossed
                              }
                            />

                            <SmallToggle
                              active={
                                item.isTodayMenu ===
                                true
                              }
                              disabled={false}
                              onClick={() =>
                                toggleField(
                                  item,
                                  "isTodayMenu"
                                )
                              }
                              label="Today's Menu"
                              icon={
                                Sparkles
                              }
                            />

                            <SmallToggle
                              active={
                                item.isChefSpecial ===
                                true
                              }
                              onClick={() =>
                                toggleField(
                                  item,
                                  "isChefSpecial"
                                )
                              }
                              label="Chef Special"
                              icon={
                                ChefHat
                              }
                            />

                            <ActionButton
                              label="Edit"
                              icon={Edit3}
                              onClick={() =>
                                setEditingItem(
                                  item
                                )
                              }
                            />
                          </>
                        )}

                        <ActionButton
                          label={
                            item.archived
                              ? "Restore"
                              : "Archive"
                          }
                          icon={
                            item.archived
                              ? RotateCcw
                              : Archive
                          }
                          onClick={() =>
                            toggleArchive(
                              item
                            )
                          }
                        />

                      </div>

                    </div>

                  </article>
                )
              )
            )}

          </div>

        </div>

      </section>

      {addingFood && (
        <AdminFoodForm
          onClose={() =>
            setAddingFood(
              false
            )
          }
        />
      )}

      {editingItem && (
        <AdminFoodForm
          item={
            editingItem
          }
          onClose={() =>
            setEditingItem(
              null
            )
          }
        />
      )}

    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[20px] border border-[#321B29]/10 bg-white p-5">

      <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#321B29]/45">
        {label}
      </p>

      <p className="mt-2 font-[var(--font-cormorant)] text-4xl font-bold text-[#321B29]">
        {value}
      </p>

    </div>
  );
}

function SmallToggle({
  active,
  disabled = false,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  icon: React.ComponentType<{
    size?: number;
  }>;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-extrabold transition ${
        active
          ? "border-[#321B29] bg-[#321B29] text-white"
          : "border-[#321B29]/10 bg-white text-[#321B29]/60"
      } ${
        disabled
          ? "cursor-not-allowed opacity-35"
          : ""
      }`}
    >
      <Icon
        size={14}
      />

      {label}
    </button>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{
    size?: number;
  }>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-[#321B29]/10 bg-white px-3.5 py-2.5 text-xs font-extrabold text-[#321B29] transition hover:border-[#D89A27]"
    >
      <Icon
        size={14}
      />

      {label}
    </button>
  );
}

