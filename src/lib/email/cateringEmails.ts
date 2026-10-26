import {
  EMAIL_FROM,
  resend,
  RESTAURANT_EMAIL,
} from "@/lib/email/resend";

type CateringEmailData = {
  reference: string;
  serviceType:
    | "corporate"
    | "event"
    | "gift-box"
    | "bulk-order";

  customer: {
    name: string;
    phone: string;
    email: string;
  };

  companyName?: string;
  eventType?: string;

  requestedDate: string;
  location: string;
  guestCount?: number;
  quantityLitres?: 3 | 5;
  budget?: string;

  recipient?: {
    name: string;
    phone: string;
    giftMessage?: string | null;
  };

  selectedMenuItems: string[];
  additionalFood?: string | null;
  notes?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function serviceName(
  serviceType:
    CateringEmailData["serviceType"]
) {
  if (
    serviceType === "corporate"
  ) {
    return "Corporate Catering";
  }

  if (serviceType === "event") {
    return "Event Catering";
  }

  if (serviceType === "bulk-order") {
    return "Bulk Order";
  }

  return "Food Gift Box";
}

function foodHtml(
  order: CateringEmailData
) {
  const selected =
    order.selectedMenuItems.length > 0
      ? `
        <ul>
          ${order.selectedMenuItems
            .map(
              (item) =>
                `<li>${escapeHtml(
                  item
                )}</li>`
            )
            .join("")}
        </ul>
      `
      : "<p>No menu foods selected.</p>";

  const additional =
    order.additionalFood
      ? `
        <p>
          <strong>Additional food / special request:</strong><br />
          ${escapeHtml(
            order.additionalFood
          )}
        </p>
      `
      : "";

  return selected + additional;
}

export async function sendRestaurantCateringEmail(
  order: CateringEmailData
) {
  const service =
    serviceName(
      order.serviceType
    );

  const result =
    await resend.emails.send({
      from: EMAIL_FROM,

      // DEVELOPMENT ONLY.
      // Production:
      // to: [RESTAURANT_EMAIL]
      to: [RESTAURANT_EMAIL],

      replyTo:
        order.customer.email,

      subject:
        `New ${service} Request - ${order.reference}`,

      html: `
        <h1>New ${escapeHtml(
          service
        )} Request</h1>

        <p>
          <strong>Reference:</strong>
          ${escapeHtml(
            order.reference
          )}
        </p>

        <h2>Customer</h2>

        <p>
          <strong>Name:</strong>
          ${escapeHtml(
            order.customer.name
          )}<br />

          <strong>Phone:</strong>
          ${escapeHtml(
            order.customer.phone
          )}<br />

          <strong>Email:</strong>
          ${escapeHtml(
            order.customer.email
          )}
        </p>

        ${
          order.companyName
            ? `<p><strong>Company:</strong> ${escapeHtml(
                order.companyName
              )}</p>`
            : ""
        }

        ${
          order.eventType
            ? `<p><strong>Event:</strong> ${escapeHtml(
                order.eventType
              )}</p>`
            : ""
        }

        <h2>Request Details</h2>

        <p>
          <strong>Date:</strong>
          ${escapeHtml(
            order.requestedDate
          )}<br />

          <strong>Location:</strong>
          ${escapeHtml(
            order.location
          )}

          ${
            order.guestCount
              ? `<br /><strong>Guests:</strong> ${order.guestCount}`
              : ""
          }

          ${
            order.budget
              ? `<br /><strong>Budget:</strong> ${escapeHtml(
                  order.budget
                )}`
              : ""
          }

          ${
            order.quantityLitres
              ? `<br /><strong>Quantity:</strong> ${order.quantityLitres} Litres`
              : ""
          }
        </p>

        ${
          order.recipient
            ? `
              <h2>Recipient</h2>

              <p>
                <strong>Name:</strong>
                ${escapeHtml(
                  order.recipient.name
                )}<br />

                <strong>Phone:</strong>
                ${escapeHtml(
                  order.recipient.phone
                )}
              </p>

              ${
                order.recipient
                  .giftMessage
                  ? `
                    <p>
                      <strong>Gift message:</strong><br />
                      ${escapeHtml(
                        order.recipient
                          .giftMessage
                      )}
                    </p>
                  `
                  : ""
              }
            `
            : ""
        }

        <h2>Food Selection</h2>

        ${foodHtml(order)}

        ${
          order.notes
            ? `
              <h2>Notes</h2>
              <p>${escapeHtml(
                order.notes
              )}</p>
            `
            : ""
        }

        <hr />

        <p>
          Production restaurant recipient:
          ${escapeHtml(
            RESTAURANT_EMAIL
          )}
        </p>
      `,
    });

  if (result.error) {
    throw new Error(
      result.error.message
    );
  }

  return result.data;
}

export async function sendCustomerCateringConfirmation(
  order: CateringEmailData
) {
  const service =
    serviceName(
      order.serviceType
    );

  const result =
    await resend.emails.send({
      from: EMAIL_FROM,

      // DEVELOPMENT ONLY.
      // Production:
      // to: [order.customer.email]
      to: [order.customer.email],

      replyTo:
        RESTAURANT_EMAIL,

      subject:
        `We received your ${service.toLowerCase()} request - ${order.reference}`,

      html: `
        <h1>
          Thank you,
          ${escapeHtml(
            order.customer.name
          )}
        </h1>

        <p>
          We have received your
          ${escapeHtml(
            service.toLowerCase()
          )}
          request.
        </p>

        <p>
          <strong>Reference:</strong>
          ${escapeHtml(
            order.reference
          )}
        </p>

        <p>
          <strong>Requested date:</strong>
          ${escapeHtml(
            order.requestedDate
          )}
        </p>

        ${
          order.quantityLitres
            ? `<p><strong>Quantity:</strong> ${order.quantityLitres} Litres</p>`
            : ""
        }

        <h2>Your Food Selection</h2>

        ${foodHtml(order)}

        <p>
          This is an enquiry/request and is
          <strong>not yet a confirmed booking or order.</strong>
          African Restaurant Estonia will confirm
          availability, pricing and the final details
          with you.
        </p>

        <p>
          Please keep your reference when continuing
          the conversation on WhatsApp.
        </p>

        <p>
          African Restaurant Estonia
        </p>
      `,
    });

  if (result.error) {
    throw new Error(
      result.error.message
    );
  }

  return result.data;
}

