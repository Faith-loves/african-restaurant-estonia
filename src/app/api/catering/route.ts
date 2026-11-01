import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { createAdminNotification } from "@/lib/admin/notifications";
import {
  sendCustomerCateringConfirmation,
  sendRestaurantCateringEmail,
} from "@/lib/email/cateringEmails";
import { allowPublicMutation } from "@/lib/server/rateLimit";

type CateringServiceType =
  | "corporate"
  | "event"
  | "gift-box"
  | "bulk-order";

type SubmittedCateringRequest = {
  idempotencyKey?: unknown;
  serviceType?: unknown;

  name?: unknown;
  phone?: unknown;
  email?: unknown;

  companyName?: unknown;
  eventType?: unknown;

  date?: unknown;
  guestCount?: unknown;
  quantityLitres?: unknown;

  location?: unknown;
  budget?: unknown;

  recipientName?: unknown;
  recipientPhone?: unknown;
  giftMessage?: unknown;

  selectedMenuItems?: unknown;

  additionalFood?: unknown;
  notes?: unknown;
};

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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function createReference(
  serviceType: CateringServiceType
) {
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

  const prefix =
    serviceType === "gift-box"
      ? "ARE-GIFT"
      : "ARE-CAT";

  return `${prefix}-${datePart}-${randomPart}`;
}

export async function POST(
  request: Request
) {
  try {
    let body: SubmittedCateringRequest;

    try {
      body =
        (await request.json()) as
          SubmittedCateringRequest;
    } catch {
      return NextResponse.json(
        {
          error:
            "The request is not valid JSON.",
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
            "The catering request must be a JSON object.",
        },
        {
          status: 400,
        }
      );
    }

    const idempotencyKey = cleanText(body.idempotencyKey, 100);

    if (!idempotencyKey || !/^[a-zA-Z0-9-]{20,100}$/.test(idempotencyKey)) {
      return NextResponse.json(
        { error: "The request submission key is missing or invalid. Please refresh the form and try again." },
        { status: 400 }
      );
    }

    const serviceType:
      CateringServiceType | null =
      body.serviceType === "corporate" ||
      body.serviceType === "event" ||
      body.serviceType === "gift-box" ||
      body.serviceType === "bulk-order"
        ? body.serviceType
        : null;

    if (!serviceType) {
      return NextResponse.json(
        {
          error:
            "Please choose a valid catering service.",
        },
        {
          status: 400,
        }
      );
    }

    const name =
      cleanText(
        body.name,
        120
      );

    const phone =
      cleanText(
        body.phone,
        50
      );

    const email =
      cleanText(
        body.email,
        254
      ).toLowerCase();

    const date =
      cleanText(
        body.date,
        30
      );

    const location =
      cleanText(
        body.location,
        300
      );

    if (
      !name ||
      !phone ||
      !email ||
      !date ||
      !location
    ) {
      return NextResponse.json(
        {
          error:
            "Name, phone, email, date and location are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidEmail(email)) {
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

    const companyName =
      cleanText(
        body.companyName,
        200
      );

    const eventType =
      cleanText(
        body.eventType,
        200
      );

    if (
      serviceType === "corporate" &&
      !companyName
    ) {
      return NextResponse.json(
        {
          error:
            "Company or organisation name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      serviceType === "event" &&
      !eventType
    ) {
      return NextResponse.json(
        {
          error:
            "Event type is required.",
        },
        {
          status: 400,
        }
      );
    }

    let guestCount: number | null =
      null;

    if (serviceType !== "gift-box") {
      if (serviceType === "bulk-order" && (body.guestCount === undefined || body.guestCount === null || body.guestCount === "")) {
        guestCount = null;
      } else {
      if (
        typeof body.guestCount !==
          "number" ||
        !Number.isInteger(
          body.guestCount
        ) ||
        body.guestCount < 1 ||
        body.guestCount > 10000
      ) {
        return NextResponse.json(
          {
            error:
              "Please enter a valid number of guests.",
          },
          {
            status: 400,
          }
        );
      }

      guestCount =
        body.guestCount;
      }
    }

    let quantityLitres: 3 | 5 | null = null;

    if (serviceType === "bulk-order") {
      const requestedQuantity = Number(body.quantityLitres);

      if (requestedQuantity !== 3 && requestedQuantity !== 5) {
        return NextResponse.json(
          { error: "Bulk Orders must use 3 or 5 litres." },
          { status: 400 }
        );
      }

      quantityLitres = requestedQuantity;
    }

    const recipientName =
      cleanText(
        body.recipientName,
        120
      );

    const recipientPhone =
      cleanText(
        body.recipientPhone,
        50
      );

    const giftMessage =
      cleanText(
        body.giftMessage,
        1000
      );

    if (
      serviceType === "gift-box" &&
      (
        !recipientName ||
        !recipientPhone
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Recipient name and phone number are required for a gift box.",
        },
        {
          status: 400,
        }
      );
    }

    const selectedMenuItems =
      Array.isArray(
        body.selectedMenuItems
      )
        ? body.selectedMenuItems
            .filter(
              (
                item
              ): item is string =>
                typeof item ===
                  "string" &&
                item.trim().length >
                  0
            )
            .map((item) =>
              item
                .trim()
                .slice(0, 200)
            )
            .slice(0, 50)
        : [];

    const budget =
      cleanText(
        body.budget,
        150
      );

    const additionalFood =
      cleanText(
        body.additionalFood,
        2000
      );

    const notes =
      cleanText(
        body.notes,
        2000
      );

    if (
      selectedMenuItems.length ===
        0 &&
      !additionalFood
    ) {
      return NextResponse.json(
        {
          error:
            "Please select at least one food or describe what you would like.",
        },
        {
          status: 400,
        }
      );
    }

    const reference =
      createReference(
        serviceType
      );

    const cateringDocument =
      adminDb
        .collection(
          "cateringRequests"
        )
        .doc(idempotencyKey);

    const existingRequest = await cateringDocument.get();

    if (existingRequest.exists) {
      const existingData = existingRequest.data();

      return NextResponse.json(
        {
          success: true,
          duplicate: true,
          requestId: cateringDocument.id,
          reference: existingData?.reference,
          status: existingData?.status ?? "pending_confirmation",
          serviceType: existingData?.serviceType ?? serviceType,
        },
        { status: 200 }
      );
    }

    const rateLimit = allowPublicMutation(request, "catering");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests were received. Please wait a little and try again." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    const cateringData = {
      reference,

      status:
        "pending_confirmation",

      source:
        "website",

      serviceType,

      customer: {
        name,
        phone,
        email,
      },

      ...(serviceType ===
      "corporate"
        ? {
            companyName,
          }
        : {}),

      ...(serviceType ===
      "event"
        ? {
            eventType,
          }
        : {}),

      requestedDate:
        date,

      location,

      ...(guestCount !== null
        ? {
            guestCount,
          }
        : {}),

      ...(quantityLitres !== null
        ? { quantityLitres }
        : {}),

      ...(budget
        ? {
            budget,
          }
        : {}),

      ...(serviceType ===
      "gift-box"
        ? {
            recipient: {
              name:
                recipientName,

              phone:
                recipientPhone,

              giftMessage:
                giftMessage ||
                null,
            },
          }
        : {}),

      selectedMenuItems,

      additionalFood:
        additionalFood ||
        null,

      notes:
        notes ||
        null,

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
      await cateringDocument.create(
        cateringData
      );
    } catch (error) {
      const duplicateRequest =
        await cateringDocument.get();

      if (duplicateRequest.exists) {
        const duplicateData =
          duplicateRequest.data();

        return NextResponse.json(
          {
            success: true,
            duplicate: true,
            requestId: cateringDocument.id,
            reference: duplicateData?.reference,
            status: duplicateData?.status ?? "pending_confirmation",
            serviceType: duplicateData?.serviceType ?? serviceType,
          },
          { status: 200 }
        );
      }

      throw error;
    }

    await createAdminNotification({
      type: serviceType === "gift-box" ? "gift-box" : "catering",
      resourceId: cateringDocument.id,
      reference,
      requesterName: name,
    });

    const emailData = {
      reference,
      serviceType,

      customer: {
        name,
        phone,
        email,
      },

      ...(companyName
        ? {
            companyName,
          }
        : {}),

      ...(eventType
        ? {
            eventType,
          }
        : {}),

      requestedDate: date,
      location,

      ...(guestCount !== null
        ? {
            guestCount,
          }
        : {}),

      ...(quantityLitres !== null
        ? { quantityLitres }
        : {}),

      ...(budget
        ? {
            budget,
          }
        : {}),

      ...(serviceType === "gift-box"
        ? {
            recipient: {
              name: recipientName,
              phone: recipientPhone,
              giftMessage:
                giftMessage || null,
            },
          }
        : {}),

      selectedMenuItems,

      additionalFood:
        additionalFood || null,

      notes:
        notes || null,
    };

    const emailStatus = {
      restaurantEmail: "pending",
      customerEmail: "pending",
    };

    try {
      await sendRestaurantCateringEmail(
        emailData
      );

      emailStatus.restaurantEmail =
        "sent";
    } catch (error) {
      console.error(
        "Restaurant catering email error:",
        error
      );

      emailStatus.restaurantEmail =
        "failed";
    }

    try {
      await sendCustomerCateringConfirmation(
        emailData
      );

      emailStatus.customerEmail =
        "sent";
    } catch (error) {
      console.error(
        "Customer catering email error:",
        error
      );

      emailStatus.customerEmail =
        "failed";
    }

    await cateringDocument.update({
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

        requestId:
          cateringDocument.id,

        reference,

        status:
          "pending_confirmation",

        serviceType,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Catering request creation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "We could not submit your request right now. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}


