import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase/client";

import {
  menuItems,
} from "@/data/menuData";

function removeUndefined(
  value: unknown
): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) =>
        removeUndefined(entry)
      )
      .filter(
        (entry) =>
          entry !== undefined
      );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const result: Record<
      string,
      unknown
    > = {};

    Object.entries(
      value as Record<
        string,
        unknown
      >
    ).forEach(
      ([key, entry]) => {
        const cleaned =
          removeUndefined(
            entry
          );

        if (
          cleaned !== undefined
        ) {
          result[key] =
            cleaned;
        }
      }
    );

    return result;
  }

  return value;
}

export async function importMenuToFirestore() {
  const batch =
    writeBatch(db);

  menuItems.forEach(
    (item) => {
      const itemRef =
        doc(
          collection(
            db,
            "menuItems"
          ),
          item.id
        );

      const cleanedItem =
        removeUndefined(
          item
        ) as Record<
          string,
          unknown
        >;

      batch.set(
        itemRef,
        {
          ...cleanedItem,

          isTodayMenu:
            false,

          isChefSpecial:
            false,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );
    }
  );

  await batch.commit();

  return menuItems.length;
}
