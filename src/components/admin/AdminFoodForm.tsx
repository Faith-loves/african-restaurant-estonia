"use client";

import Image from "next/image";

import type {
  ChangeEvent,
  FormEvent,
  ReactNode,
} from "react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  ImageIcon,
  Loader2,
  Minus,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  db,
} from "@/lib/firebase/client";

import {
  deleteMenuImage,
  uploadMenuImage,
} from "@/lib/cloudinaryUpload";

export type AdminFoodItem = {
  id: string;

  name: string;

  estonianName?: string;

  description?: string;

  category?: string;

  image?: string;

  imagePublicId?: string;

  available?: boolean;

  pricePending?: boolean;

  isTodayMenu?: boolean;

  isChefSpecial?: boolean;

  isVegan?: boolean;

  isCombo?: boolean;

  archived?: boolean;

  sizes?: Array<{
    label: string;
    price?: number;
  }>;

  addOns?: Array<{
    name: string;
    price?: number;
  }>;
};

type EditableSize = {
  label: string;
  price: string;
};

type EditableAddOn = {
  name: string;
  price: string;
};

const categories = [
  "STARTER",
  "MAIN DISHES",
  "SOUP",
  "CHEF'S SPECIAL",
  "DRINKS",
  "SNACKS",
  "PROTEINS",
  "SAUCE",
  "VEGAN OPTIONS",
  "COMBO OPTIONS",
];

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const supportedImageTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

function itemToSizes(
  item?: AdminFoodItem | null
): EditableSize[] {
  if (
    !item?.sizes ||
    item.sizes.length === 0
  ) {
    return [
      {
        label: "Regular",
        price: "",
      },
    ];
  }

  return item.sizes.map(
    (size) => ({
      label: size.label,

      price:
        typeof size.price ===
        "number"
          ? String(size.price)
          : "",
    })
  );
}

function itemToAddOns(
  item?: AdminFoodItem | null
): EditableAddOn[] {
  if (
    !item?.addOns ||
    item.addOns.length === 0
  ) {
    return [];
  }

  return item.addOns.map(
    (addOn) => ({
      name: addOn.name,

      price:
        typeof addOn.price ===
        "number"
          ? String(addOn.price)
          : "",
    })
  );
}

export default function AdminFoodForm({
  item,
  onClose,
  onSaved,
}: {
  item?: AdminFoodItem | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const editing =
    Boolean(item);

  const [
    name,
    setName,
  ] = useState(
    item?.name ?? ""
  );

  const [
    estonianName,
    setEstonianName,
  ] = useState(
    item?.estonianName ?? ""
  );

  const [
    description,
    setDescription,
  ] = useState(
    item?.description ?? ""
  );

  const [
    category,
    setCategory,
  ] = useState(
    item?.category ??
      "MAIN DISHES"
  );

  const [
    currentImage,
    setCurrentImage,
  ] = useState(
    item?.image ?? ""
  );

  const [
    currentImagePublicId,
    setCurrentImagePublicId,
  ] = useState(
    item?.imagePublicId ?? ""
  );

  const [
    selectedImage,
    setSelectedImage,
  ] = useState<File | null>(
    null
  );

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");

  const [
    removeImage,
    setRemoveImage,
  ] = useState(false);

  const [
    available,
    setAvailable,
  ] = useState(
    item?.available ?? false
  );

  const [
    isTodayMenu,
    setIsTodayMenu,
  ] = useState(
    item?.isTodayMenu ?? false
  );

  const [
    isChefSpecial,
    setIsChefSpecial,
  ] = useState(
    item?.isChefSpecial ?? false
  );

  const [
    isVegan,
    setIsVegan,
  ] = useState(
    item?.isVegan ??
      item?.category ===
        "VEGAN OPTIONS"
  );

  const [
    isCombo,
    setIsCombo,
  ] = useState(
    item?.isCombo ??
      item?.category ===
        "COMBO OPTIONS"
  );

  const [
    sizes,
    setSizes,
  ] = useState<
    EditableSize[]
  >(
    itemToSizes(item)
  );

  const [
    addOns,
    setAddOns,
  ] = useState<
    EditableAddOn[]
  >(
    itemToAddOns(item)
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploadStatus,
    setUploadStatus,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setName(item?.name ?? "");
      setEstonianName(item?.estonianName ?? "");
      setDescription(item?.description ?? "");
      setCategory(item?.category ?? "MAIN DISHES");
      setCurrentImage(item?.image ?? "");
      setCurrentImagePublicId(item?.imagePublicId ?? "");
      setSelectedImage(null);
      setImagePreview("");
      setRemoveImage(false);
      setAvailable(item?.available ?? false);
      setIsTodayMenu(item?.isTodayMenu ?? false);
      setIsChefSpecial(item?.isChefSpecial ?? false);
      setIsVegan(item?.isVegan ?? item?.category === "VEGAN OPTIONS");
      setIsCombo(item?.isCombo ?? item?.category === "COMBO OPTIONS");
      setSizes(itemToSizes(item));
      setAddOns(itemToAddOns(item));
      setError("");
      setUploadStatus("");
    });

    return () => {
      cancelled = true;
    };
  }, [item]);

  useEffect(() => {
    if (!selectedImage) {
      queueMicrotask(() => {
        setImagePreview("");
      });

      return;
    }

    const objectUrl =
      URL.createObjectURL(
        selectedImage
      );

    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        setImagePreview(objectUrl);
      }
    });

    return () => {
      cancelled = true;
      URL.revokeObjectURL(
        objectUrl
      );
    };
  }, [selectedImage]);

  const hasPendingPrice =
    useMemo(() => {
      if (
        sizes.length === 0
      ) {
        return true;
      }

      return sizes.some(
        (size) => {
          const value =
            Number(
              size.price
            );

          return (
            !size.price.trim() ||
            !Number.isFinite(
              value
            ) ||
            value <= 0
          );
        }
      );
    }, [sizes]);

  const displayedImage =
    imagePreview ||
    (
      removeImage
        ? ""
        : currentImage
    );

  const immediatelyOrderable =
    isTodayMenu &&
    available &&
    !hasPendingPrice &&
    item?.archived !== true;

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (
      !supportedImageTypes.has(
        file.type
      )
    ) {
      setError(
        "Use a JPG, PNG or WebP image."
      );

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setError(
        "The food image must be 5 MB or smaller."
      );

      event.target.value =
        "";

      return;
    }

    setSelectedImage(file);

    setRemoveImage(false);
  }

  function updateSize(
    index: number,
    field:
      | "label"
      | "price",
    value: string
  ) {
    setSizes(
      (current) =>
        current.map(
          (
            size,
            sizeIndex
          ) =>
            sizeIndex ===
            index
              ? {
                  ...size,
                  [field]:
                    value,
                }
              : size
        )
    );
  }

  function addSize() {
    setSizes(
      (current) => [
        ...current,
        {
          label: "",
          price: "",
        },
      ]
    );
  }

  function removeSize(
    index: number
  ) {
    setSizes(
      (current) =>
        current.filter(
          (
            _,
            sizeIndex
          ) =>
            sizeIndex !==
            index
        )
    );
  }

  function updateAddOn(
    index: number,
    field:
      | "name"
      | "price",
    value: string
  ) {
    setAddOns(
      (current) =>
        current.map(
          (
            addOn,
            addOnIndex
          ) =>
            addOnIndex ===
            index
              ? {
                  ...addOn,
                  [field]:
                    value,
                }
              : addOn
        )
    );
  }

  function addAddOn() {
    setAddOns(
      (current) => [
        ...current,
        {
          name: "",
          price: "",
        },
      ]
    );
  }

  function removeAddOn(
    index: number
  ) {
    setAddOns(
      (current) =>
        current.filter(
          (
            _,
            addOnIndex
          ) =>
            addOnIndex !==
            index
        )
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    setUploadStatus("");

    const cleanName =
      name.trim();

    if (!cleanName) {
      setError(
        "Food name is required."
      );

      return;
    }

    if (
      sizes.length === 0
    ) {
      setError(
        "Add at least one size or portion."
      );

      return;
    }

    const cleanSizes: Array<{
      label: string;
      price?: number;
    }> = [];

    for (
      const size of sizes
    ) {
      const cleanLabel =
        size.label.trim();

      if (!cleanLabel) {
        setError(
          "Every size must have a name."
        );

        return;
      }

      if (
        size.price.trim()
      ) {
        const price =
          Number(
            size.price
          );

        if (
          !Number.isFinite(
            price
          ) ||
          price <= 0
        ) {
          setError(
            `Enter a valid price for ${cleanLabel}.`
          );

          return;
        }

        cleanSizes.push({
          label:
            cleanLabel,
          price,
        });
      } else {
        cleanSizes.push({
          label:
            cleanLabel,
        });
      }
    }

    const cleanAddOns: Array<{
      name: string;
      price: number;
    }> = [];

    for (
      const addOn of addOns
    ) {
      const addOnName =
        addOn.name.trim();

      const addOnPrice =
        addOn.price.trim();

      if (
        !addOnName &&
        !addOnPrice
      ) {
        continue;
      }

      if (!addOnName) {
        setError(
          "Every priced add-on must have a name."
        );

        return;
      }

      if (!addOnPrice) {
        setError(
          `Enter a price for ${addOnName}.`
        );

        return;
      }

      const price =
        Number(
          addOnPrice
        );

      if (
        !Number.isFinite(
          price
        ) ||
        price < 0
      ) {
        setError(
          `Enter a valid price for ${addOnName}.`
        );

        return;
      }

      cleanAddOns.push({
        name:
          addOnName,

        price,
      });
    }

    const pending =
      cleanSizes.some(
        (size) =>
          typeof size.price !==
            "number" ||
          size.price <= 0
      );

    setSaving(true);

    let newlyUploaded:
      | {
          secureUrl: string;
          publicId: string;
        }
      | undefined;

    try {
      let finalImage =
        removeImage
          ? ""
          : currentImage;

      let finalPublicId =
        removeImage
          ? ""
          : currentImagePublicId;

      if (selectedImage) {
        setUploadStatus(
          "Uploading food image..."
        );

        newlyUploaded =
          await uploadMenuImage(
            selectedImage
          );

        finalImage =
          newlyUploaded.secureUrl;

        finalPublicId =
          newlyUploaded.publicId;
      }

      setUploadStatus(
        "Saving menu information..."
      );

      const payload = {
        name:
          cleanName,

        estonianName:
          estonianName.trim(),

        description:
          description.trim(),

        category,

        image:
          finalImage,

        imagePublicId:
          finalPublicId,

        sizes:
          cleanSizes,

        addOns:
          cleanAddOns,

        pricePending:
          pending,

        available,

        isTodayMenu,

        isChefSpecial,

        isVegan,

        isCombo,

        archived:
          item?.archived ??
          false,

        updatedAt:
          serverTimestamp(),
      };

      if (
        editing &&
        item
      ) {
        await setDoc(
          doc(
            db,
            "menuItems",
            item.id
          ),
          payload,
          { merge: true }
        );
      } else {
        await addDoc(
          collection(
            db,
            "menuItems"
          ),
          {
            ...payload,

            createdAt:
              serverTimestamp(),
          }
        );
      }

      const previousPublicId =
        currentImagePublicId;

      if (
        previousPublicId &&
        previousPublicId !==
          finalPublicId
      ) {
        try {
          await deleteMenuImage(
            previousPublicId
          );
        } catch (
          deleteError
        ) {
          console.warn(
            "Old image cleanup failed:",
            deleteError
          );
        }
      }

      setUploadStatus("");

      onSaved?.();

      onClose();
    } catch (saveError) {
      console.error(
        "Food save error:",
        saveError
      );

      if (
        newlyUploaded?.publicId
      ) {
        try {
          await deleteMenuImage(
            newlyUploaded.publicId
          );
        } catch (
          cleanupError
        ) {
          console.warn(
            "New image cleanup failed:",
            cleanupError
          );
        }
      }

      setUploadStatus("");

      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "Unable to save this food."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-5">

      <div className="max-h-[95vh] w-full max-w-[820px] overflow-y-auto rounded-t-[28px] bg-[#FFF8EC] shadow-2xl no-scrollbar sm:rounded-[28px]">

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#321B29]/10 bg-white px-5 py-4 sm:px-7">

          <div>

            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#B9472E]">
              Menu Management
            </p>

            <h2 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29]">
              {editing
                ? `Edit ${item?.name}`
                : "Add New Food"}
            </h2>

          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#321B29]/10 bg-[#FFF8EC] text-[#321B29]"
          >
            <X
              size={19}
            />
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 p-5 sm:p-7"
        >

          {error && (
            <div className="rounded-2xl border border-[#B9472E]/20 bg-[#B9472E]/10 px-5 py-4 text-sm font-bold text-[#B9472E]">
              {error}
            </div>
          )}

          {uploadStatus && (
            <div className="flex items-center gap-3 rounded-2xl border border-[#D89A27]/30 bg-[#D89A27]/10 px-5 py-4 text-sm font-bold text-[#321B29]">

              <Loader2 className="h-4 w-4 animate-spin" />

              {uploadStatus}

            </div>
          )}

          <section className="rounded-[22px] border border-[#321B29]/10 bg-white p-5">

            <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
              Food Information
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <Field
                label="Food Name"
                required
              >
                <input
                  value={name}
                  onChange={(
                    event
                  ) =>
                    setName(
                      event.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="e.g. Jollof Rice"
                />
              </Field>

              <Field label="Estonian Name">
                <input
                  value={
                    estonianName
                  }
                  onChange={(
                    event
                  ) =>
                    setEstonianName(
                      event.target.value
                    )
                  }
                  className="admin-input"
                  placeholder="Optional"
                />
              </Field>

              <Field
                label="Category"
                required
              >
                <select
                  value={
                    category
                  }
                  onChange={(
                    event
                  ) =>
                    setCategory(
                      event.target.value
                    )
                  }
                  className="admin-input"
                >
                  {categories.map(
                    (
                      option
                    ) => (
                      <option
                        key={
                          option
                        }
                        value={
                          option
                        }
                      >
                        {
                          option
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

            </div>

            <Field label="Description">
              <textarea
                value={
                  description
                }
                onChange={(
                  event
                ) =>
                  setDescription(
                    event.target.value
                  )
                }
                rows={4}
                className="admin-input mt-2 resize-none"
                placeholder="Describe the meal..."
              />
            </Field>

          </section>

          <section className="rounded-[22px] border border-[#321B29]/10 bg-white p-5">

            <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
              Food Image
            </h3>

            <p className="mt-1 text-xs font-semibold text-[#151313]/50">
              JPG, PNG or WebP. Maximum 5 MB.
            </p>

            <div className="mt-5 overflow-hidden rounded-[20px] bg-[#FFF8EC]">

              {displayedImage ? (
                <Image
                  src={
                    displayedImage
                  }
                  alt={
                    name ||
                    "Food preview"
                  }
                  width={1200}
                  height={240}
                  unoptimized
                  className="h-[240px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[200px] items-center justify-center">

                  <div className="text-center text-[#321B29]/35">

                    <ImageIcon
                      size={31}
                      className="mx-auto"
                    />

                    <p className="mt-2 text-xs font-bold">
                      No food image
                    </p>

                  </div>

                </div>
              )}

            </div>

            <div className="mt-4 flex flex-wrap gap-3">

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#321B29] px-4 py-3 text-xs font-extrabold text-white">

                <Upload
                  size={16}
                />

                {displayedImage
                  ? "Change Image"
                  : "Choose Image"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />

              </label>

              {displayedImage && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(
                      null
                    );

                    setImagePreview(
                      ""
                    );

                    setRemoveImage(
                      true
                    );
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#B9472E]/20 px-4 py-3 text-xs font-extrabold text-[#B9472E]"
                >
                  <Trash2
                    size={15}
                  />
                  Remove Image
                </button>
              )}

            </div>

          </section>

          <section className="rounded-[22px] border border-[#321B29]/10 bg-white p-5">

            <div className="flex items-center justify-between gap-4">

              <div>

                <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                  Sizes & Prices
                </h3>

                <p className="mt-1 text-xs font-semibold text-[#151313]/50">
                  Blank prices remain Price Pending.
                </p>

              </div>

              <button
                type="button"
                onClick={addSize}
                className="inline-flex items-center gap-2 rounded-xl bg-[#321B29] px-4 py-2.5 text-xs font-extrabold text-white"
              >
                <Plus
                  size={15}
                />
                Add Size
              </button>

            </div>

            <div className="mt-5 space-y-3">

              {sizes.map(
                (
                  size,
                  index
                ) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-2xl bg-[#FFF8EC] p-4 sm:grid-cols-[1fr_180px_auto]"
                  >

                    <input
                      value={
                        size.label
                      }
                      onChange={(
                        event
                      ) =>
                        updateSize(
                          index,
                          "label",
                          event.target.value
                        )
                      }
                      placeholder="Size"
                      className="admin-input"
                    />

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#321B29]/50">
                        €
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          size.price
                        }
                        onChange={(
                          event
                        ) =>
                          updateSize(
                            index,
                            "price",
                            event.target.value
                          )
                        }
                        placeholder="Price"
                        className="admin-input pl-8"
                      />

                    </div>

                    <button
                      type="button"
                      disabled={
                        sizes.length ===
                        1
                      }
                      onClick={() =>
                        removeSize(
                          index
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#B9472E]/15 text-[#B9472E] disabled:opacity-25"
                    >
                      <Minus
                        size={16}
                      />
                    </button>

                  </div>
                )
              )}

            </div>

            {hasPendingPrice && (
              <div className="mt-4 rounded-xl bg-[#D89A27]/10 px-4 py-3 text-xs font-bold leading-5 text-[#321B29]">
                Price is still pending. You can still select this as Today&apos;s Menu or mark it Available, but customers cannot order it immediately until the missing price is entered.
              </div>
            )}

          </section>

          <section className="rounded-[22px] border border-[#321B29]/10 bg-white p-5">

            <div className="flex items-center justify-between gap-4">

              <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
                Add-ons
              </h3>

              <button
                type="button"
                onClick={addAddOn}
                className="inline-flex items-center gap-2 rounded-xl border border-[#321B29]/15 px-4 py-2.5 text-xs font-extrabold text-[#321B29]"
              >
                <Plus
                  size={15}
                />
                Add Add-on
              </button>

            </div>

            <div className="mt-5 space-y-3">

              {addOns.length ===
              0 ? (
                <p className="rounded-xl bg-[#FFF8EC] px-4 py-4 text-sm font-semibold text-[#151313]/45">
                  No add-ons configured.
                </p>
              ) : (
                addOns.map(
                  (
                    addOn,
                    index
                  ) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-2xl bg-[#FFF8EC] p-4 sm:grid-cols-[1fr_180px_auto]"
                    >

                      <input
                        value={
                          addOn.name
                        }
                        onChange={(
                          event
                        ) =>
                          updateAddOn(
                            index,
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="Add-on name"
                        className="admin-input"
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          addOn.price
                        }
                        onChange={(
                          event
                        ) =>
                          updateAddOn(
                            index,
                            "price",
                            event.target.value
                          )
                        }
                        placeholder="Price"
                        className="admin-input"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeAddOn(
                            index
                          )
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#B9472E]/15 text-[#B9472E]"
                      >
                        <Minus
                          size={16}
                        />
                      </button>

                    </div>
                  )
                )
              )}

            </div>

          </section>

          <section className="rounded-[22px] border border-[#321B29]/10 bg-white p-5">

            <h3 className="font-[var(--font-cormorant)] text-2xl font-bold text-[#321B29]">
              Menu Controls
            </h3>

            <p className="mt-1 text-xs font-semibold leading-5 text-[#151313]/50">
              These controls are independent. The website decides whether an item can actually be ordered using all the required conditions.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <ControlToggle
                label="Available"
                description="The restaurant currently has this meal."
                checked={
                  available
                }
                onChange={
                  setAvailable
                }
              />

              <ControlToggle
                label="Today's Menu"
                description="The client has selected this meal for today's immediate menu."
                checked={
                  isTodayMenu
                }
                onChange={
                  setIsTodayMenu
                }
              />

              <ControlToggle
                label="Chef's Special"
                description="Feature this meal as a Chef's Special."
                checked={
                  isChefSpecial
                }
                onChange={
                  setIsChefSpecial
                }
              />

              <ControlToggle
                label="Vegan"
                description="Mark this food as vegan."
                checked={
                  isVegan
                }
                onChange={
                  setIsVegan
                }
              />

              <ControlToggle
                label="Combo"
                description="Mark this as a combo option."
                checked={
                  isCombo
                }
                onChange={
                  setIsCombo
                }
              />

            </div>

            <div
              className={`mt-5 rounded-2xl px-4 py-4 text-sm font-bold ${
                immediatelyOrderable
                  ? "bg-green-50 text-green-800"
                  : "bg-[#FFF8EC] text-[#321B29]"
              }`}
            >
              {immediatelyOrderable
                ? "✓ This food meets the conditions for immediate ordering."
                : "This food is not currently eligible for immediate ordering. It may still be shown in the full menu and requested for catering, events or gifting."}
            </div>

          </section>

          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-[#321B29]/10 bg-[#FFF8EC] py-4 sm:flex-row sm:justify-end">

            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-[#321B29]/15 px-6 py-3.5 text-sm font-extrabold text-[#321B29]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#321B29] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#D89A27] hover:text-[#321B29] disabled:opacity-60"
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

                  {editing
                    ? "Save Changes"
                    : "Add Food"}
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.12em] text-[#321B29]/55">
        {label}

        {required && (
          <span className="text-[#B9472E]">
            {" "}*
          </span>
        )}
      </span>

      {children}

    </label>
  );
}

function ControlToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(
          !checked
        )
      }
      className={`rounded-2xl border p-4 text-left transition ${
        checked
          ? "border-[#321B29] bg-[#321B29] text-white"
          : "border-[#321B29]/10 bg-[#FFF8EC] text-[#321B29]"
      }`}
    >

      <div className="flex items-center justify-between gap-4">

        <div>

          <p className="font-extrabold">
            {label}
          </p>

          <p
            className={`mt-1 text-xs font-semibold leading-5 ${
              checked
                ? "text-white/60"
                : "text-[#151313]/45"
            }`}
          >
            {description}
          </p>

        </div>

        <div
          className={`relative h-6 w-11 shrink-0 rounded-full ${
            checked
              ? "bg-[#D89A27]"
              : "bg-[#321B29]/15"
          }`}
        >
          <div
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
              checked
                ? "left-6"
                : "left-1"
            }`}
          />
        </div>

      </div>

    </button>
  );
}
