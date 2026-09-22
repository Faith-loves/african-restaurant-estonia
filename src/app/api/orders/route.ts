import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminAuth } from "@/lib/firebase/admin";

import { adminDb } from "@/lib/firebase/admin";
import {
  sendCustomerOrderConfirmation,
  sendRestaurantOrderEmail,
} from "@/lib/email/orderEmails";
import { createAdminNotification } from "@/lib/admin/notifications";
import { allowPublicMutation } from "@/lib/server/rateLimit";
import { getGuestTokenFromRequest, hashGuestToken } from "@/lib/server/guestSession";

type SubmittedAddOn = {
  name?: unknown;
  price?: unknown;
};

type SubmittedCartItem = {
  id?: unknown;
  menuItemId?: unknown;
  name?: unknown;

  size?: {
    label?: unknown;
    price?: unknown;
  };

  addOns?: SubmittedAddOn[];
  quantity?: unknown;
};

type SubmittedOrderDetails = {
  fulfilment?: unknown;

  name?: unknown;
  phone?: unknown;
  email?: unknown;

  address?: unknown;
  city?: unknown;
  postalCode?: unknown;

  orderingForSomeoneElse?: unknown;

  recipientName?: unknown;
  recipientPhone?: unknown;

  notes?: unknown;
};

type OrderRequestBody = {
  details?: SubmittedOrderDetails;
  items?: SubmittedCartItem[];
  idempotencyKey?: unknown;
};

type FirestoreMenuSize = {
  label?: unknown;
  price?: unknown;
};

type FirestoreMenuAddOn = {
  name?: unknown;
  price?: unknown;
};

type FirestoreMenuItem = {
  name?: unknown;
  estonianName?: unknown;
  sizes?: FirestoreMenuSize[];
  addOns?: FirestoreMenuAddOn[];

  available?: unknown;
  pricePending?: unknown;
  isTodayMenu?: unknown;
  archived?: unknown;
};

type ValidatedOrderItem = {
  menuItemId: string;
  name: string;
  estonianName?: string;

  size: {
    label: string;
    price: number;
  };

  addOns: {
    name: string;
    price: number;
  }[];

  quantity: number;
  unitTotal: number;
  lineTotal: number;
};

const MAX_ITEMS = 50;
const MAX_QUANTITY = 99;

function cleanText(
  value: unknown,
  maximumLength: number
) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .slice(0, maximumLength);
}

function normaliseLabel(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("en-US");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function roundCurrency(value: number) {
  return Math.round(
    (value + Number.EPSILON) * 100
  ) / 100;
}

function createOrderReference() {
  const now = new Date();

  const datePart = [
    now.getUTCFullYear(),
    String(
      now.getUTCMonth() + 1
    ).padStart(2, "0"),
    String(
      now.getUTCDate()
    ).padStart(2, "0"),
  ].join("");

  const randomPart =
    crypto.randomUUID()
      .replace(/-/g, "")
      .slice(0, 6)
      .toUpperCase();

  return `ARE-${datePart}-${randomPart}`;
}

async function getVerifiedCustomerUid(
  request: Request
) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authorization.slice("Bearer ".length);
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch {
    return null;
  }
}

async function getVerifiedGuestSessionId(request: Request) {
  const token = getGuestTokenFromRequest(request);
  if (!token) return null;
  const sessionId = hashGuestToken(token);
  const session = await adminDb.collection("guestSessions").doc(sessionId).get();
  return session.exists ? sessionId : null;
}

export async function POST(
  request: Request
) {
  try {
    let body: OrderRequestBody;

    try {
      body =
        (await request.json()) as OrderRequestBody;
    } catch {
      return NextResponse.json(
        {
          error:
            "The order request is not valid JSON.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          error:
            "The order request must be a JSON object.",
        },
        {
          status: 400,
        }
      );
    }

    const verifiedCustomerUid =
      await getVerifiedCustomerUid(request);
    const verifiedGuestSessionId = verifiedCustomerUid
      ? null
      : await getVerifiedGuestSessionId(request);

    const details = body.details;
    const submittedItems = body.items;

    const idempotencyKey =
      cleanText(
        body.idempotencyKey,
        100
      );

    if (
      !idempotencyKey ||
      !/^[a-zA-Z0-9-]{20,100}$/.test(
        idempotencyKey
      )
    ) {
      return NextResponse.json(
        {
          error:
            "The order submission key is missing or invalid. Please refresh the checkout and try again.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !details ||
      typeof details !== "object"
    ) {
      return NextResponse.json(
        {
          error:
            "Customer details are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Array.isArray(submittedItems) ||
      submittedItems.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Your order does not contain any items.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      submittedItems.length > MAX_ITEMS
    ) {
      return NextResponse.json(
        {
          error:
            "There are too many items in this order.",
        },
        {
          status: 400,
        }
      );
    }

    const fulfilment =
      details.fulfilment === "delivery"
        ? "delivery"
        : details.fulfilment === "pickup"
          ? "pickup"
          : null;

    if (!fulfilment) {
      return NextResponse.json(
        {
          error:
            "Please choose pickup or delivery.",
        },
        {
          status: 400,
        }
      );
    }

    const customerName =
      cleanText(
        details.name,
        120
      );

    const customerPhone =
      cleanText(
        details.phone,
        50
      );

    const customerEmail =
      cleanText(
        details.email,
        254
      ).toLowerCase();

    const notes =
      cleanText(
        details.notes,
        1500
      );

    if (
      !customerName ||
      !customerPhone ||
      !customerEmail
    ) {
      return NextResponse.json(
        {
          error:
            "Name, phone number and email address are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidEmail(
        customerEmail
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    const address =
      cleanText(
        details.address,
        250
      );

    const city =
      cleanText(
        details.city,
        100
      );

    const postalCode =
      cleanText(
        details.postalCode,
        30
      );

    if (
      fulfilment === "delivery" &&
      (
        !address ||
        !city ||
        !postalCode
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A complete delivery address is required.",
        },
        {
          status: 400,
        }
      );
    }

    const orderingForSomeoneElse =
      details.orderingForSomeoneElse === true;

    const recipientName =
      cleanText(
        details.recipientName,
        120
      );

    const recipientPhone =
      cleanText(
        details.recipientPhone,
        50
      );

    if (
      fulfilment === "delivery" &&
      orderingForSomeoneElse &&
      (
        !recipientName ||
        !recipientPhone
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Recipient name and phone number are required.",
        },
        {
          status: 400,
        }
      );
    }

    const validatedItems:
      ValidatedOrderItem[] = [];

    let subtotal = 0;

    for (
      const submittedItem
      of submittedItems
    ) {
      const menuItemId =
        cleanText(
          submittedItem.menuItemId,
          200
        );

      if (!menuItemId) {
        return NextResponse.json(
          {
            error:
              "One of the order items is invalid.",
          },
          {
            status: 400,
          }
        );
      }

      const quantity =
        typeof submittedItem.quantity ===
          "number" &&
        Number.isInteger(
          submittedItem.quantity
        )
          ? submittedItem.quantity
          : 0;

      if (
        quantity < 1 ||
        quantity > MAX_QUANTITY
      ) {
        return NextResponse.json(
          {
            error:
              "One of the order quantities is invalid.",
          },
          {
            status: 400,
          }
        );
      }

      const menuDocument =
        await adminDb
          .collection("menuItems")
          .doc(menuItemId)
          .get();

      if (
        !menuDocument.exists
      ) {
        return NextResponse.json(
          {
            error:
              "One of the selected meals no longer exists on the menu.",
            menuItemId,
          },
          {
            status: 409,
          }
        );
      }

      const menuItem =
        menuDocument.data() as
          FirestoreMenuItem;

      const menuName =
        cleanText(
          menuItem.name,
          200
        );

      if (!menuName) {
        return NextResponse.json(
          {
            error:
              "One of the menu items is not configured correctly.",
            menuItemId,
          },
          {
            status: 409,
          }
        );
      }

      if (
        menuItem.archived === true
      ) {
        return NextResponse.json(
          {
            error:
              `${menuName} is no longer on the menu.`,
            menuItemId,
          },
          {
            status: 409,
          }
        );
      }

      if (
        menuItem.available !== true
      ) {
        return NextResponse.json(
          {
            error:
              `${menuName} is currently unavailable.`,
            menuItemId,
          },
          {
            status: 409,
          }
        );
      }

      if (
        menuItem.isTodayMenu !== true
      ) {
        return NextResponse.json(
          {
            error:
              `${menuName} is not available on today's menu.`,
            menuItemId,
          },
          {
            status: 409,
          }
        );
      }

      if (
        menuItem.pricePending === true
      ) {
        return NextResponse.json(
          {
            error:
              `${menuName} cannot be ordered online until its price has been confirmed.`,
            menuItemId,
          },
          {
            status: 409,
          }
        );
      }

      const requestedSizeLabel =
        cleanText(
          submittedItem.size?.label,
          120
        );

      if (
        !requestedSizeLabel
      ) {
        return NextResponse.json(
          {
            error:
              `Please choose a valid size for ${menuName}.`,
            menuItemId,
          },
          {
            status: 400,
          }
        );
      }

      const sizes =
        Array.isArray(
          menuItem.sizes
        )
          ? menuItem.sizes
          : [];

      const selectedSize =
        sizes.find(
          (size) => {
            const label =
              cleanText(
                size.label,
                120
              );

            return (
              label &&
              normaliseLabel(
                label
              ) ===
                normaliseLabel(
                  requestedSizeLabel
                )
            );
          }
        );

      if (
        !selectedSize ||
        typeof selectedSize.price !==
          "number" ||
        !Number.isFinite(
          selectedSize.price
        ) ||
        selectedSize.price <= 0
      ) {
        return NextResponse.json(
          {
            error:
              `The selected size for ${menuName} is no longer available.`,
            menuItemId,
          },
          {
            status: 409,
          }
        );
      }

      const selectedSizeLabel =
        cleanText(
          selectedSize.label,
          120
        );

      const selectedSizePrice =
        roundCurrency(
          selectedSize.price
        );

      const requestedAddOns =
        Array.isArray(
          submittedItem.addOns
        )
          ? submittedItem.addOns
          : [];

      const menuAddOns =
        Array.isArray(
          menuItem.addOns
        )
          ? menuItem.addOns
          : [];

      const validatedAddOns:
        {
          name: string;
          price: number;
        }[] = [];

      const usedAddOnNames =
        new Set<string>();

      for (
        const requestedAddOn
        of requestedAddOns
      ) {
        const requestedName =
          cleanText(
            requestedAddOn.name,
            160
          );

        if (!requestedName) {
          return NextResponse.json(
            {
              error:
                `One of the extras selected for ${menuName} is invalid.`,
              menuItemId,
            },
            {
              status: 400,
            }
          );
        }

        const normalisedName =
          normaliseLabel(
            requestedName
          );

        if (
          usedAddOnNames.has(
            normalisedName
          )
        ) {
          continue;
        }

        const matchingAddOn =
          menuAddOns.find(
            (addOn) => {
              const name =
                cleanText(
                  addOn.name,
                  160
                );

              return (
                name &&
                normaliseLabel(
                  name
                ) ===
                  normalisedName
              );
            }
          );

        if (
          !matchingAddOn ||
          typeof matchingAddOn.price !==
            "number" ||
          !Number.isFinite(
            matchingAddOn.price
          ) ||
          matchingAddOn.price < 0
        ) {
          return NextResponse.json(
            {
              error:
                `${requestedName} is no longer available as an extra for ${menuName}.`,
              menuItemId,
            },
            {
              status: 409,
            }
          );
        }

        usedAddOnNames.add(
          normalisedName
        );

        validatedAddOns.push({
          name:
            cleanText(
              matchingAddOn.name,
              160
            ),

          price:
            roundCurrency(
              matchingAddOn.price
            ),
        });
      }

      const addOnTotal =
        validatedAddOns.reduce(
          (
            total,
            addOn
          ) =>
            total +
            addOn.price,
          0
        );

      const unitTotal =
        roundCurrency(
          selectedSizePrice +
            addOnTotal
        );

      const lineTotal =
        roundCurrency(
          unitTotal *
            quantity
        );

      subtotal =
        roundCurrency(
          subtotal +
            lineTotal
        );

      const estonianName =
        cleanText(
          menuItem.estonianName,
          200
        );

      validatedItems.push({
        menuItemId,
        name: menuName,

        ...(estonianName
          ? {
              estonianName,
            }
          : {}),

        size: {
          label:
            selectedSizeLabel,
          price:
            selectedSizePrice,
        },

        addOns:
          validatedAddOns,

        quantity,
        unitTotal,
        lineTotal,
      });
    }

    const reference =
      createOrderReference();

    const orderDocument =
      adminDb
        .collection("orders")
        .doc(idempotencyKey);

    const existingOrder =
      await orderDocument.get();

    if (existingOrder.exists) {
      const existingData =
        existingOrder.data();

      return NextResponse.json(
        {
          success: true,
          duplicate: true,
          orderId:
            orderDocument.id,
          reference:
            existingData?.reference,
          subtotal:
            existingData?.subtotal,
          currency:
            existingData?.currency ??
            "EUR",
          status:
            existingData?.status ??
            "pending_confirmation",
        },
        {
          status: 200,
        }
      );
    }

    const rateLimit = allowPublicMutation(request, "orders");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many order submissions were received. Please wait a little and try again." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    const orderData = {
      reference,

      ...(verifiedCustomerUid
        ? {
            customerUid: verifiedCustomerUid,
            customerType: "registered",
          }
        : {
            customerType: "guest",
            ...(verifiedGuestSessionId ? { guestSessionId: verifiedGuestSessionId } : {}),
          }),

      status:
        "pending_confirmation",

      source:
        "website",

      fulfilment:
        fulfilment as "pickup" | "delivery",

      customer: {
        name:
          customerName,

        phone:
          customerPhone,

        email:
          customerEmail,
      },

      delivery:
        fulfilment ===
        "delivery"
          ? {
              address,
              city,
              postalCode,

              orderingForSomeoneElse,

              ...(orderingForSomeoneElse
                ? {
                    recipientName,
                    recipientPhone,
                  }
                : {}),
            }
          : null,

      notes:
        notes || null,

      items:
        validatedItems,

      currency:
        "EUR",

      subtotal,

      deliveryCharge:
        null,

      total:
        subtotal,

      payment: {
        required:
          false,

        status:
          "not_collected_online",
      },

      notificationStatus: {
        restaurantEmail:
          "pending",

        customerEmail:
          "pending",

        whatsapp:
          "pending",
      },

      createdAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp(),
    };

    try {
      await orderDocument.create(
        orderData
      );
    } catch (error) {
      const duplicateOrder =
        await orderDocument.get();

      if (duplicateOrder.exists) {
        const duplicateData =
          duplicateOrder.data();

        return NextResponse.json(
          {
            success: true,
            duplicate: true,
            orderId:
              orderDocument.id,
            reference:
              duplicateData?.reference,
            subtotal:
              duplicateData?.subtotal,
            currency:
              duplicateData?.currency ??
              "EUR",
            status:
              duplicateData?.status ??
              "pending_confirmation",
          },
          {
            status: 200,
          }
        );
      }

      throw error;
    }

    await createAdminNotification({
      type: "order",
      resourceId: orderDocument.id,
      reference,
      requesterName: customerName,
    });

    const emailOrderData = {
      reference,
      fulfilment:
        fulfilment as "pickup" | "delivery",

      customer: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
      },

      delivery:
        fulfilment === "delivery"
          ? {
              address,
              city,
              postalCode,
              orderingForSomeoneElse,

              ...(orderingForSomeoneElse
                ? {
                    recipientName,
                    recipientPhone,
                  }
                : {}),
            }
          : null,

      notes: notes || null,
      items: validatedItems,
      subtotal,
    };

    const emailStatus = {
      restaurantEmail: "pending",
      customerEmail: "pending",
    };

    try {
      await sendRestaurantOrderEmail(
        emailOrderData
      );

      emailStatus.restaurantEmail =
        "sent";
    } catch (error) {
      emailStatus.restaurantEmail =
        "failed";

      console.error(
        "Restaurant order email error:",
        error
      );
    }

    try {
      await sendCustomerOrderConfirmation(
        emailOrderData
      );

      emailStatus.customerEmail =
        "sent";
    } catch (error) {
      emailStatus.customerEmail =
        "failed";

      console.error(
        "Customer confirmation email error:",
        error
      );
    }

    await orderDocument.update({
      "notificationStatus.restaurantEmail":
        emailStatus.restaurantEmail,

      "notificationStatus.customerEmail":
        emailStatus.customerEmail,

      updatedAt:
        FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,

        orderId:
          orderDocument.id,

        reference,

        subtotal,

        currency:
          "EUR",

        status:
          "pending_confirmation",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Order creation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "We could not submit your order right now. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}



