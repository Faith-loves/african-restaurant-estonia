"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  auth,
  db,
} from "@/lib/firebase/client";

import {
  menuItems as catalogMenuItems,
  menuImageById,
} from "@/data/menuData";
import MenuItemImage from "@/components/menu/MenuItemImage";

type TodayMenuItem = {
  id: string;
  name: string;
  category?: string;
  image?: string;

  available: boolean;
  pricePending: boolean;

  isTodayMenu: boolean;
  archived: boolean;
};

function setsEqual(
  first: Set<string>,
  second: Set<string>
) {
  if (
    first.size !==
    second.size
  ) {
    return false;
  }

  for (
    const value of first
  ) {
    if (
      !second.has(value)
    ) {
      return false;
    }
  }

  return true;
}

export default function AdminTodayMenu() {
  const router =
    useRouter();

  const [
    authorized,
    setAuthorized,
  ] = useState(false);

  const [
    checkingAdmin,
    setCheckingAdmin,
  ] = useState(true);

  const [
    loadingMenu,
    setLoadingMenu,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    items,
    setItems,
  ] = useState<
    TodayMenuItem[]
  >([]);

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<
    Set<string>
  >(new Set());

  const [
    originalIds,
    setOriginalIds,
  ] = useState<
    Set<string>
  >(new Set());

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    remoteChanged,
    setRemoteChanged,
  ] = useState(false);

  const selectedIdsRef =
    useRef<Set<string>>(
      new Set()
    );

  const originalIdsRef =
    useRef<Set<string>>(
      new Set()
    );

  const savingRef =
    useRef(false);

  useEffect(() => {
    selectedIdsRef.current =
      selectedIds;
  }, [selectedIds]);

  useEffect(() => {
    originalIdsRef.current =
      originalIds;
  }, [originalIds]);

  useEffect(() => {
    savingRef.current =
      saving;
  }, [saving]);

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
              await signOut(
                auth
              );

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
              await signOut(
                auth
              );

              router.replace(
                "/login"
              );

              return;
            }

            setAuthorized(
              true
            );

            setCheckingAdmin(
              false
            );
          } catch (
            authError
          ) {
            console.error(
              "Admin verification error:",
              authError
            );

            setError(
              "Unable to verify administrator access."
            );

            setCheckingAdmin(
              false
            );
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

    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "menuItems"
        ),
        (snapshot) => {
          const menuItemsById = new Map<string, TodayMenuItem>(
            catalogMenuItems.map((item) => [
              item.id,
              {
                id: item.id,
                name: item.name,
                category: item.category,
                image: item.image,
                available: item.available,
                pricePending: item.pricePending === true,
                isTodayMenu: item.isTodayMenu === true,
                archived: item.archived === true,
              },
            ])
          );

          snapshot.docs.forEach((menuDocument) => {
            const data = menuDocument.data();

            menuItemsById.set(menuDocument.id, {
              id: menuDocument.id,
              name:
                typeof data.name === "string"
                  ? data.name
                  : "Unnamed Food",
              category:
                typeof data.category === "string"
                  ? data.category
                  : undefined,
              image:
                typeof data.image === "string"
                  ? data.image
                  : menuImageById[menuDocument.id],
              available: data.available === true,
              pricePending: data.pricePending === true,
              isTodayMenu: data.isTodayMenu === true,
              archived: data.archived === true,
            });
          });

          const menuItems = Array.from(menuItemsById.values())
              .filter(
                (item) =>
                  !item.archived
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

          const remoteSelectedIds =
            new Set(
              menuItems
                .filter(
                  (item) =>
                    item.isTodayMenu
                )
                .map(
                  (item) =>
                    item.id
                )
            );

          setItems(
            menuItems
          );

          const localHasUnsavedChanges =
            !setsEqual(
              selectedIdsRef.current,
              originalIdsRef.current
            );

          if (
            savingRef.current
          ) {
            setLoadingMenu(
              false
            );

            return;
          }

          if (
            !localHasUnsavedChanges
          ) {
            setSelectedIds(
              new Set(
                remoteSelectedIds
              )
            );

            setOriginalIds(
              new Set(
                remoteSelectedIds
              )
            );

            setRemoteChanged(
              false
            );
          } else if (
            !setsEqual(
              remoteSelectedIds,
              originalIdsRef.current
            )
          ) {
            setRemoteChanged(
              true
            );
          }

          setLoadingMenu(
            false
          );
        },
        (snapshotError) => {
          console.error(
            "Today's Menu realtime listener error:",
            snapshotError
          );

          setError(
            "Unable to load Today's Menu from Firestore."
          );

          setLoadingMenu(
            false
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, [authorized]);

  const filteredItems =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      if (!term) {
        return items;
      }

      return items.filter(
        (item) =>
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
    }, [
      items,
      search,
    ]);

  const hasUnsavedChanges =
    !setsEqual(
      selectedIds,
      originalIds
    );

  const selectedCount =
    selectedIds.size;

  const orderableTodayCount =
    items.filter(
      (item) =>
        selectedIds.has(
          item.id
        ) &&
        item.available &&
        !item.pricePending
    ).length;

  function toggleItem(
    id: string
  ) {
    setSuccess("");

    setSelectedIds(
      (current) => {
        const next =
          new Set(
            current
          );

        if (
          next.has(id)
        ) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
      }
    );
  }

  function selectAllVisible() {
    setSuccess("");

    setSelectedIds(
      (current) => {
        const next =
          new Set(
            current
          );

        filteredItems.forEach(
          (item) => {
            next.add(
              item.id
            );
          }
        );

        return next;
      }
    );
  }

  function clearTodayMenu() {
    setSuccess("");

    setSelectedIds(
      new Set()
    );
  }

  function loadLatestFirestoreVersion() {
    const latestIds =
      new Set(
        items
          .filter(
            (item) =>
              item.isTodayMenu
          )
          .map(
            (item) =>
              item.id
          )
      );

    setSelectedIds(
      new Set(
        latestIds
      )
    );

    setOriginalIds(
      new Set(
        latestIds
      )
    );

    setRemoteChanged(
      false
    );

    setSuccess(
      "Latest Today's Menu changes have been loaded."
    );
  }

  async function saveTodayMenu() {
    setError("");
    setSuccess("");

    if (remoteChanged) {
      setError(
        "Today's Menu was changed in another tab. Load the latest changes before saving so you do not overwrite them."
      );

      return;
    }

    const changedItems =
      items.filter(
        (item) => {
          const wasSelected =
            originalIds.has(
              item.id
            );

          const isSelected =
            selectedIds.has(
              item.id
            );

          return (
            wasSelected !==
            isSelected
          );
        }
      );

    if (
      changedItems.length ===
      0
    ) {
      setSuccess(
        "Today's Menu is already up to date."
      );

      return;
    }

    setSaving(true);

    savingRef.current =
      true;

    try {
      const batch =
        writeBatch(db);

      changedItems.forEach(
        (item) => {
          batch.update(
            doc(
              db,
              "menuItems",
              item.id
            ),
            {
              isTodayMenu:
                selectedIds.has(
                  item.id
                ),

              updatedAt:
                serverTimestamp(),
            }
          );
        }
      );

      await batch.commit();

      setOriginalIds(
        new Set(
          selectedIds
        )
      );

      setItems(
        (current) =>
          current.map(
            (item) => ({
              ...item,

              isTodayMenu:
                selectedIds.has(
                  item.id
                ),
            })
          )
      );

      setRemoteChanged(
        false
      );

      setSuccess(
        "Today's Menu has been saved successfully."
      );
    } catch (
      saveError
    ) {
      console.error(
        "Today's Menu save error:",
        saveError
      );

      setError(
        "Today's Menu could not be saved."
      );
    } finally {
      savingRef.current =
        false;

      setSaving(false);
    }
  }

  if (
    checkingAdmin ||
    loadingMenu
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8EC]">

        <div className="text-center">

          <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#321B29]" />

          <p className="mt-4 text-sm font-bold text-[#321B29]/60">
            Loading Today&apos;s Menu...
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
              aria-label="Back to admin dashboard"
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
                Today&apos;s Menu
              </h1>

            </div>

          </div>

          <button
            type="button"
            onClick={
              saveTodayMenu
            }
            disabled={
              saving ||
              remoteChanged
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#321B29] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29] disabled:cursor-not-allowed disabled:opacity-45"
          >

            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save
                  size={17}
                />
                Save Today&apos;s Menu
              </>
            )}

          </button>

        </div>

      </header>

      <section className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-12">

        <div className="rounded-[26px] bg-[#321B29] p-6 text-white sm:p-8">

          <Sparkles
            size={24}
            className="text-[#D89A27]"
          />

          <h2 className="mt-4 font-[var(--font-cormorant)] text-4xl font-bold sm:text-5xl">
            What are we serving today?
          </h2>

          <p className="mt-2 max-w-[680px] text-sm font-semibold leading-7 text-white/65">
            This screen stays synchronized with Menu Management. Changes made there will appear here automatically.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/45">
                Selected Today
              </p>

              <p className="mt-1 font-[var(--font-cormorant)] text-4xl font-bold text-[#D89A27]">
                {selectedCount}
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/45">
                Orderable Now
              </p>

              <p className="mt-1 font-[var(--font-cormorant)] text-4xl font-bold text-[#D89A27]">
                {orderableTodayCount}
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/45">
                Unsaved Changes
              </p>

              <p className="mt-1 font-[var(--font-cormorant)] text-4xl font-bold text-[#D89A27]">
                {hasUnsavedChanges
                  ? "Yes"
                  : "No"}
              </p>

            </div>

          </div>

        </div>

        {remoteChanged && (
          <div className="mt-5 rounded-2xl border border-[#D89A27]/40 bg-[#D89A27]/15 p-5">

            <div className="flex items-start gap-3">

              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-[#B9472E]"
              />

              <div className="flex-1">

                <p className="font-bold text-[#321B29]">
                  Today&apos;s Menu changed in another tab.
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-[#151313]/60">
                  You currently have unsaved selections here, so we did not overwrite them automatically.
                </p>

                <button
                  type="button"
                  onClick={
                    loadLatestFirestoreVersion
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#321B29] px-4 py-2.5 text-xs font-extrabold text-white"
                >
                  <RefreshCw
                    size={15}
                  />
                  Load Latest Changes
                </button>

              </div>

            </div>

          </div>
        )}

        <div className="mt-5 rounded-2xl border border-[#D89A27]/25 bg-[#D89A27]/10 p-4">

          <p className="text-sm font-bold leading-6 text-[#321B29]">
            A meal can be selected for Today&apos;s Menu even if it is temporarily unavailable or still has a pending price. Customers can only order immediately when Today&apos;s Menu, Available and confirmed pricing are all valid.
          </p>

        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-[#B9472E]/20 bg-[#B9472E]/10 p-4 text-sm font-bold text-[#B9472E]">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-700/15 bg-green-50 p-4 text-sm font-bold text-green-800">

            <Check
              size={18}
            />

            {success}

          </div>
        )}

        <div className="mt-7 rounded-[24px] border border-[#321B29]/10 bg-white p-5 sm:p-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
                Select Foods
              </h2>

              <p className="mt-1 text-sm font-semibold text-[#151313]/50">
                Tick or untick foods, then save the new Today&apos;s Menu.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={
                  selectAllVisible
                }
                className="rounded-xl border border-[#321B29]/10 px-4 py-2.5 text-xs font-extrabold text-[#321B29]"
              >
                Select All Visible
              </button>

              <button
                type="button"
                onClick={
                  clearTodayMenu
                }
                className="rounded-xl border border-[#B9472E]/15 px-4 py-2.5 text-xs font-extrabold text-[#B9472E]"
              >
                Clear Today&apos;s Menu
              </button>

            </div>

          </div>

          <div className="relative mt-5">

            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#321B29]/40"
            />

            <input
              aria-label="Search menu items"
              value={
                search
              }
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

          <div className="mt-6 grid gap-3 md:grid-cols-2">

            {filteredItems.map(
              (item) => {
                const selected =
                  selectedIds.has(
                    item.id
                  );

                return (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      toggleItem(
                        item.id
                      )
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-[#321B29] bg-[#321B29] text-white"
                        : "border-[#321B29]/10 bg-[#FFF8EC] text-[#321B29] hover:border-[#D89A27]"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                        <MenuItemImage
                          name={item.name}
                        image={item.image}
                          className="h-full w-full"
                        />
                      </div>

                      <div
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                          selected
                            ? "border-[#D89A27] bg-[#D89A27] text-[#321B29]"
                            : "border-[#321B29]/20 bg-white"
                        }`}
                      >

                        {selected && (
                          <Check
                            size={14}
                          />
                        )}

                      </div>

                      <div className="min-w-0 flex-1">

                        <h3 className="font-[var(--font-cormorant)] text-2xl font-bold">
                          {item.name}
                        </h3>

                        {item.category && (
                          <p
                            className={`mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                              selected
                                ? "text-white/45"
                                : "text-[#B9472E]"
                            }`}
                          >
                            {item.category}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">

                          <StatusBadge
                            selected={
                              selected
                            }
                            good={
                              item.available
                            }
                            text={
                              item.available
                                ? "Available"
                                : "Currently Unavailable"
                            }
                          />

                          <StatusBadge
                            selected={
                              selected
                            }
                            good={
                              !item.pricePending
                            }
                            text={
                              item.pricePending
                                ? "Price Pending"
                                : "Price Confirmed"
                            }
                          />

                        </div>

                      </div>

                      <UtensilsCrossed
                        size={18}
                        className={
                          selected
                            ? "text-[#D89A27]"
                            : "text-[#321B29]/30"
                        }
                      />

                    </div>

                  </button>
                );
              }
            )}

          </div>

        </div>

      </section>

    </main>
  );
}

function StatusBadge({
  selected,
  good,
  text,
}: {
  selected: boolean;
  good: boolean;
  text: string;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
        selected
          ? good
            ? "bg-green-400/15 text-green-200"
            : "bg-white/10 text-white/60"
          : good
            ? "bg-green-50 text-green-700"
            : "bg-[#D89A27]/15 text-[#321B29]/65"
      }`}
    >
      {text}
    </span>
  );
}
