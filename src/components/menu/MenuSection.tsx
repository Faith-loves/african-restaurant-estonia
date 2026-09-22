"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Loader2,
  Search,
  X,
} from "lucide-react";

import {
  db,
} from "@/lib/firebase/client";

import {
  menuItems as catalogMenuItems,
  menuImageById,
} from "@/data/menuData";

import type {
  MenuAddOn,
  MenuCategory,
  MenuItem,
  MenuSize,
} from "@/types/menu";

import FoodDetailsModal from "./FoodDetailsModal";
import MenuItemImage from "./MenuItemImage";

type FilterCategory =
  | "ALL"
  | MenuCategory;

type FirestoreMenuRecord =
  Record<string, unknown>;

const categories:
  FilterCategory[] = [
    "ALL",
    "STARTER",
    "MAIN DISH",
    "SOUP",
    "CHEF'S SPECIAL",
    "DRINKS",
    "SNACKS",
    "PROTEIN",
    "SAUCE",
    "SWALLOW/FUFU",
    "VEGAN OPTIONS",
    "COMBO OPTIONS",
  ];

const categoryLabels:
  Record<
    FilterCategory,
    string
  > = {
    ALL: "All",

    STARTER:
      "Starters",

    "MAIN DISH":
      "Main Dishes",

    SOUP:
      "Soups",

    "CHEF'S SPECIAL":
      "Chef's Special",

    DRINKS:
      "Drinks",

    SNACKS:
      "Snacks",

    PROTEIN:
      "Proteins",

    SAUCE:
      "Sauces",

    "SWALLOW/FUFU":
      "Swallow / Fufu",

    "VEGAN OPTIONS":
      "Vegan Options",

    "COMBO OPTIONS":
      "Combo Options",
  };

function normalizeCategory(
  value: unknown
): MenuCategory {
  switch (value) {
    case "STARTER":
      return "STARTER";

    case "MAIN DISH":
    case "MAIN DISHES":
      return "MAIN DISH";

    case "SOUP":
      return "SOUP";

    case "CHEF'S SPECIAL":
      return "CHEF'S SPECIAL";

    case "DRINKS":
      return "DRINKS";

    case "SNACKS":
      return "SNACKS";

    case "PROTEIN":
    case "PROTEINS":
      return "PROTEIN";

    case "SAUCE":
      return "SAUCE";

    case "SWALLOW/FUFU":
      return "SWALLOW/FUFU";

    case "VEGAN OPTIONS":
      return "VEGAN OPTIONS";

    case "COMBO OPTIONS":
      return "COMBO OPTIONS";

    default:
      return "MAIN DISH";
  }
}

function normalizeTags(
  value: unknown
): MenuCategory[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        entry
      ): entry is string =>
        typeof entry ===
        "string"
    )
    .map(
      (entry) =>
        normalizeCategory(
          entry
        )
    );
}

function normalizeSizes(
  value: unknown
): MenuSize[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (
        !entry ||
        typeof entry !==
          "object"
      ) {
        return null;
      }

      const record =
        entry as Record<
          string,
          unknown
        >;

      const label =
        typeof record.label ===
        "string"
          ? record.label
          : "";

      const price =
        typeof record.price ===
          "number" &&
        Number.isFinite(
          record.price
        )
          ? record.price
          : undefined;

      if (!label.trim()) {
        return null;
      }

      return {
        label,
        ...(price !==
        undefined
          ? {
              price,
            }
          : {}),
      };
    })
    .filter(
      (
        entry
      ): entry is MenuSize =>
        entry !== null
    );
}

function normalizeAddOns(
  value: unknown
): MenuAddOn[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (
        !entry ||
        typeof entry !==
          "object"
      ) {
        return null;
      }

      const record =
        entry as Record<
          string,
          unknown
        >;

      const name =
        typeof record.name ===
        "string"
          ? record.name
          : "";

      const price =
        typeof record.price ===
          "number" &&
        Number.isFinite(
          record.price
        )
          ? record.price
          : undefined;

      if (!name.trim()) {
        return null;
      }

      return {
        name,
        ...(price !==
        undefined
          ? {
              price,
            }
          : {}),
      };
    })
    .filter(
      (
        entry
      ): entry is MenuAddOn =>
        entry !== null
    );
}

function mapFirestoreMenuItem(
  id: string,
  data: FirestoreMenuRecord
): MenuItem {
  const sizes =
    normalizeSizes(
      data.sizes
    );

  const addOns =
    normalizeAddOns(
      data.addOns
    );

  const calculatedPricePending =
    sizes.length === 0 ||
    sizes.some(
      (size) =>
        typeof size.price !==
          "number" ||
        !Number.isFinite(
          size.price
        ) ||
        size.price <= 0
    );

  return {
    id,

    name:
      typeof data.name ===
      "string"
        ? data.name
        : "Unnamed Food",

    estonianName:
      typeof data.estonianName ===
      "string"
        ? data.estonianName
        : undefined,

    description:
      typeof data.description ===
      "string"
        ? data.description
        : undefined,

    category:
      normalizeCategory(
        data.category
      ),

    sizes,

    addOns,

    tags:
      normalizeTags(
        data.tags
      ),

    available:
      data.available ===
      true,

    pricePending:
      data.pricePending ===
        true ||
      calculatedPricePending,

    image:
      typeof data.image ===
      "string"
        ? data.image
        : menuImageById[id],

    imagePublicId:
      typeof data.imagePublicId ===
      "string"
        ? data.imagePublicId
        : undefined,

    isTodayMenu:
      data.isTodayMenu ===
      true,

    isChefSpecial:
      data.isChefSpecial ===
      true,

    isVegan:
      data.isVegan ===
      true,

    isCombo:
      data.isCombo ===
      true,

    archived:
      data.archived ===
      true,
  };
}

function getStartingPrice(
  item: MenuItem
) {
  const prices =
    item.sizes
      .map(
        (size) =>
          size.price
      )
      .filter(
        (
          price
        ): price is number =>
          typeof price ===
            "number" &&
          Number.isFinite(
            price
          ) &&
          price > 0
      );

  if (
    prices.length === 0
  ) {
    return null;
  }

  return Math.min(
    ...prices
  );
}

function canOrderImmediately(
  item: MenuItem
) {
  const startingPrice =
    getStartingPrice(
      item
    );

  return (
    item.archived !==
      true &&
    item.isTodayMenu ===
      true &&
    item.available ===
      true &&
    item.pricePending !==
      true &&
    startingPrice !==
      null
  );
}

export default function MenuSection() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const specialFilter =
    searchParams.get(
      "filter"
    );

  const [
    menuItems,
    setMenuItems,
  ] = useState<
    MenuItem[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    activeCategory,
    setActiveCategory,
  ] =
    useState<FilterCategory>(
      "ALL"
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedItem,
    setSelectedItem,
  ] =
    useState<MenuItem | null>(
      null
    );

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "menuItems"
        ),
        (snapshot) => {
          const remoteItems =
            snapshot.docs.map(
              (menuDocument) =>
                mapFirestoreMenuItem(
                  menuDocument.id,
                  menuDocument.data()
                )
            );

          const remoteIds = new Set(
            remoteItems.map((item) => item.id)
          );

          const items =
            [
              ...remoteItems,
              ...catalogMenuItems.filter(
                (item) => !remoteIds.has(item.id)
              ),
            ]
              .filter(
                (item) =>
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
            items
          );

          setLoadError("");

          setLoading(
            false
          );
        },
        (error) => {
          console.error(
            "Public menu Firestore error:",
            error
          );

          setLoadError(
            "We could not load the restaurant menu right now. Please try again shortly."
          );

          setLoading(
            false
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  const specialFilterDetails =
    useMemo(() => {
      switch (
        specialFilter
      ) {
        case "today":
          return {
            title:
              "Today's Menu",

            description:
              "Meals selected by the restaurant for today's service. Only dishes that are available and fully priced can be ordered immediately.",
          };

        case "chef":
          return {
            title:
              "Chef's Special",

            description:
              "Special selections chosen by the restaurant.",
          };

        case "vegan":
          return {
            title:
              "Vegan Options",

            description:
              "Explore dishes marked as vegan options by the restaurant.",
          };

        case "combo":
          return {
            title:
              "Combo Options",

            description:
              "Browse the restaurant's combo meal options.",
          };

        default:
          return null;
      }
    }, [
      specialFilter,
    ]);

  const filteredItems =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return menuItems.filter(
        (item) => {
          let matchesSpecialFilter =
            true;

          if (
            specialFilter ===
            "today"
          ) {
            matchesSpecialFilter =
              item.isTodayMenu ===
              true;
          }

          if (
            specialFilter ===
            "chef"
          ) {
            matchesSpecialFilter =
              item.isChefSpecial ===
                true ||
              item.tags?.includes(
                "CHEF'S SPECIAL"
              ) === true;
          }

          if (
            specialFilter ===
            "vegan"
          ) {
            matchesSpecialFilter =
              item.isVegan ===
                true ||
              item.category ===
                "VEGAN OPTIONS" ||
              item.tags?.includes(
                "VEGAN OPTIONS"
              ) === true;
          }

          if (
            specialFilter ===
            "combo"
          ) {
            matchesSpecialFilter =
              item.isCombo ===
                true ||
              item.category ===
                "COMBO OPTIONS" ||
              item.tags?.includes(
                "COMBO OPTIONS"
              ) === true;
          }

          const matchesCategory =
            specialFilter
              ? true
              : activeCategory ===
                  "ALL" ||
                item.category ===
                  activeCategory ||
                item.tags?.includes(
                  activeCategory as MenuCategory
                ) === true;

          const matchesSearch =
            !searchValue ||
            item.name
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            item.estonianName
              ?.toLowerCase()
              .includes(
                searchValue
              ) ||
            item.description
              ?.toLowerCase()
              .includes(
                searchValue
              );

          return (
            matchesSpecialFilter &&
            matchesCategory &&
            Boolean(
              matchesSearch
            )
          );
        }
      );
    }, [
      activeCategory,
      menuItems,
      search,
      specialFilter,
    ]);

  function chooseCategory(
    category:
      FilterCategory
  ) {
    setActiveCategory(
      category
    );

    if (
      specialFilter
    ) {
      router.push(
        "/menu"
      );
    }
  }

  if (loading) {
    return (
      <section className="flex min-h-[500px] items-center justify-center bg-white px-5 py-14">

        <div className="text-center">

          <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#321B29]" />

          <p className="mt-4 text-sm font-bold text-[#321B29]/60">
            Loading restaurant menu...
          </p>

        </div>

      </section>
    );
  }

  return (
    <>
      <section className="bg-white px-5 py-14 sm:px-8 lg:px-10">

        <div className="mx-auto max-w-[1500px]">

          <div className="mx-auto max-w-[800px] text-center">

            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-[#B9472E]">
              Our Menu
            </p>

            <h2 className="mt-2 font-[var(--font-cormorant)] text-4xl font-bold text-[#321B29] sm:text-5xl md:text-6xl">

              {specialFilterDetails
                ? specialFilterDetails.title
                : "Find Something You'll Love"}

            </h2>

            <p className="mx-auto mt-3 max-w-[680px] text-sm font-semibold leading-6 text-[#151313]/65 sm:text-base">

              {specialFilterDetails
                ? specialFilterDetails.description
                : "Explore everything African Restaurant Estonia can prepare. Foods not selected for today's service can still be requested for catering, events and gifting."}

            </p>

            {specialFilterDetails && (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/menu"
                  )
                }
                className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-2 text-sm font-bold text-[#321B29]"
              >
                <X
                  size={15}
                />

                View Full Menu
              </button>
            )}

          </div>

          {loadError && (
            <div className="mx-auto mt-8 max-w-[720px] rounded-2xl border border-[#B9472E]/20 bg-[#B9472E]/10 px-5 py-4 text-center text-sm font-bold leading-6 text-[#B9472E]">
              {loadError}
            </div>
          )}

          {!loadError && (
            <>
              <div className="mx-auto mt-8 max-w-[660px]">

                <div className="flex items-center gap-3 rounded-xl border border-[#321B29]/15 bg-[#FFF8EC] px-4 py-3">

                  <Search
                    size={19}
                    className="shrink-0 text-[#B9472E]"
                  />

                  <input
                    type="text"
                    aria-label="Search menu"
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
                    placeholder="Search jollof, egusi, plantain..."
                    className="w-full bg-transparent text-sm font-semibold text-[#151313] outline-none placeholder:text-[#151313]/40"
                  />

                </div>

              </div>

              {!specialFilter && (
                <div className="no-scrollbar mt-7 overflow-x-auto pb-2">

                  <div className="mx-auto flex w-max min-w-full justify-start gap-2 lg:justify-center">

                    {categories.map(
                      (
                        category
                      ) => {
                        const active =
                          activeCategory ===
                          category;

                        return (
                          <button
                            key={
                              category
                            }
                            type="button"
                            onClick={() =>
                              chooseCategory(
                                category
                              )
                            }
                            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${
                              active
                                ? "bg-[#321B29] text-white"
                                : "border border-[#321B29]/15 bg-[#FFF8EC] text-[#321B29] hover:border-[#D89A27]"
                            }`}
                          >
                            {
                              categoryLabels[
                                category
                              ]
                            }
                          </button>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

              {filteredItems.length >
              0 ? (
                <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                  {filteredItems.map(
                    (item) => {
                      const startingPrice =
                        getStartingPrice(
                          item
                        );

                      const canChoose =
                        canOrderImmediately(
                          item
                        );

                      const selectedToday =
                        item.isTodayMenu ===
                        true;

                      return (
                        <article
                          key={
                            item.id
                          }
                          className={`group overflow-hidden rounded-[18px] border bg-[#FFF8EC] shadow-[0_5px_18px_rgba(50,27,41,0.06)] transition duration-300 ${
                            canChoose
                              ? item.isVegan
                                ? "border-[#294B73]/45 hover:-translate-y-1 hover:border-[#294B73] hover:shadow-[0_10px_25px_rgba(50,27,41,0.13)]"
                                : "border-[#321B29]/10 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(50,27,41,0.13)]"
                              : "border-[#321B29]/8"
                          }`}
                        >

                          <div className="relative h-[145px] overflow-hidden bg-[#321B29]/5">

                            <MenuItemImage
                              name={item.name}
                              image={item.image || "/images/hero/hero-food.png"}
                              className={`transition duration-500 ${
                                canChoose
                                  ? "group-hover:scale-105"
                                  : "opacity-80"
                              }`}
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-[#321B29]/35 via-transparent to-transparent" />

                            <span
                              className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold shadow-sm ${
                                canChoose
                                  ? "bg-white text-green-700"
                                  : item.pricePending
                                    ? "bg-[#D89A27] text-[#321B29]"
                                    : "bg-[#B9472E] text-white"
                              }`}
                            >
                              {canChoose
                                ? "Available Today"
                                : item.pricePending
                                  ? "Price Pending"
                                  : selectedToday &&
                                      !item.available
                                    ? "Not Available Today"
                                    : "Not Available Today"}
                            </span>

                          </div>

                          <div className="p-4">

                            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#B9472E]">
                              {
                                categoryLabels[
                                  item.category
                                ]
                              }
                            </p>

                            <h3 className="mt-1 font-[var(--font-cormorant)] text-[27px] font-bold leading-tight text-[#321B29]">
                              {
                                item.name
                              }
                            </h3>

                            {item.estonianName && (
                              <p className="mt-0.5 text-xs font-semibold italic text-[#321B29]/50">
                                {
                                  item.estonianName
                                }
                              </p>
                            )}

                            {item.description ? (
                              <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-[#151313]/65">
                                {
                                  item.description
                                }
                              </p>
                            ) : (
                              <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-[#151313]/45">
                                Full details will be added once confirmed by the restaurant.
                              </p>
                            )}

                            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#321B29]/10 pt-4">

                              <div className="min-w-[92px] rounded-xl bg-[#D89A27]/15 px-3 py-2">

                                {startingPrice !==
                                null ? (
                                  <>
                                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#321B29]/55">
                                      From
                                    </p>

                                    <p className="font-[var(--font-cormorant)] text-[26px] font-bold leading-none text-[#321B29]">
                                      €
                                      {startingPrice.toFixed(
                                        2
                                      )}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#321B29]/55">
                                      Price
                                    </p>

                                    <p className="text-sm font-extrabold text-[#321B29]">
                                      Pending
                                    </p>
                                  </>
                                )}

                              </div>

                              <button
                                type="button"
                                disabled={
                                  !canChoose
                                }
                                onClick={() =>
                                  setSelectedItem(
                                    item
                                  )
                                }
                                className={`rounded-lg px-4 py-2.5 text-xs font-extrabold transition ${
                                  canChoose
                                    ? "bg-[#321B29] text-white hover:bg-[#D89A27] hover:text-[#321B29]"
                                    : "cursor-not-allowed bg-[#321B29]/8 text-[#321B29]/40"
                                }`}
                              >
                                {canChoose
                                  ? "Choose"
                                  : "Not Available Today"}
                              </button>

                            </div>

                            {!canChoose && (
                              <p className="mt-3 text-[11px] font-semibold leading-5 text-[#151313]/45">
                                This dish may still be requested for catering, events or gifting.
                              </p>
                            )}

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>
              ) : (
                <div className="mt-10 rounded-[20px] border border-dashed border-[#321B29]/20 bg-[#FFF8EC] px-6 py-10 text-center">

                  <h3 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">

                    {specialFilter ===
                    "today"
                      ? "Today's Menu has not been selected yet"
                      : specialFilter ===
                          "chef"
                        ? "No Chef's Special selected yet"
                        : "Nothing found here"}

                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-[#151313]/55">

                    {specialFilter ===
                    "today"
                      ? "The restaurant will select the dishes being served today from the admin dashboard."
                      : "Try another category or search term."}

                  </p>

                </div>
              )}
            </>
          )}

        </div>

      </section>

      <FoodDetailsModal
        item={
          selectedItem
        }
        onClose={() =>
          setSelectedItem(
            null
          )
        }
      />

    </>
  );
}
