import {
  EMAIL_FROM,
  resend,
  RESTAURANT_EMAIL,
} from "@/lib/email/resend";

type OrderEmailItem = {
  name: string;
  size: {
    label: string;
    price: number;
  };
  addOns: {
    name: string;
    price: number;
  }[];
  quantity: number;
  lineTotal: number;
};

type OrderEmailData = {
  reference: string;
  fulfilment: "pickup" | "delivery";

  customer: {
    name: string;
    phone: string;
    email: string;
  };

  delivery: {
    address: string;
    city: string;
    postalCode: string;
    orderingForSomeoneElse: boolean;
    recipientName?: string;
    recipientPhone?: string;
  } | null;

  notes: string | null;
  items: OrderEmailItem[];
  subtotal: number;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createItemsHtml(
  items: OrderEmailItem[]
) {
  return items
    .map((item) => {
      const extras =
        item.addOns.length > 0
          ? `
            <div style="color:#696969;font-size:13px;margin-top:4px;">
              Extras: ${item.addOns
                .map(
                  (addOn) =>
                    `${escapeHtml(addOn.name)} (+€${addOn.price.toFixed(2)})`
                )
                .join(", ")}
            </div>
          `
          : "";

      return `
        <div style="padding:14px 0;border-bottom:1px solid #eee;">
          <div style="font-weight:700;color:#321B29;">
            ${item.quantity} × ${escapeHtml(item.name)}
          </div>

          <div style="font-size:13px;color:#696969;margin-top:4px;">
            Size: ${escapeHtml(item.size.label)}
          </div>

          ${extras}

          <div style="font-weight:700;margin-top:6px;">
            €${item.lineTotal.toFixed(2)}
          </div>
        </div>
      `;
    })
    .join("");
}

export async function sendRestaurantOrderEmail(
  order: OrderEmailData
) {
  const itemsHtml =
    createItemsHtml(order.items);

  const deliveryHtml =
    order.fulfilment === "delivery" &&
    order.delivery
      ? `
        <h3 style="color:#321B29;">Delivery</h3>

        <p>
          ${escapeHtml(order.delivery.address)}<br />
          ${escapeHtml(order.delivery.city)},
          ${escapeHtml(order.delivery.postalCode)}
        </p>

        ${
          order.delivery.orderingForSomeoneElse
            ? `
              <p>
                <strong>Recipient:</strong>
                ${escapeHtml(
                  order.delivery.recipientName || ""
                )}<br />

                <strong>Recipient phone:</strong>
                ${escapeHtml(
                  order.delivery.recipientPhone || ""
                )}
              </p>
            `
            : ""
        }
      `
      : `
        <p>
          <strong>Fulfilment:</strong> Pickup
        </p>
      `;

  const { data, error } =
    await resend.emails.send({
      from: EMAIL_FROM,

      // During development Resend only permits
      // delivery to the verified account email.
      // RESTAURANT_EMAIL remains the real
      // production recipient.
      to: [RESTAURANT_EMAIL],

      replyTo: order.customer.email,

      subject:
        `New ARE Order - ${order.reference}`,

      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;line-height:1.6;color:#151313;">
          <h1 style="color:#321B29;">
            New Website Order
          </h1>

          <p>
            <strong>Reference:</strong>
            ${escapeHtml(order.reference)}
          </p>

          <h3 style="color:#321B29;">
            Customer
          </h3>

          <p>
            ${escapeHtml(order.customer.name)}<br />
            ${escapeHtml(order.customer.phone)}<br />
            ${escapeHtml(order.customer.email)}
          </p>

          ${deliveryHtml}

          <h3 style="color:#321B29;">
            Order
          </h3>

          ${itemsHtml}

          <p style="font-size:20px;font-weight:700;color:#321B29;">
            Subtotal: €${order.subtotal.toFixed(2)}
          </p>

          ${
            order.notes
              ? `
                <h3 style="color:#321B29;">
                  Order Notes
                </h3>

                <p>
                  ${escapeHtml(order.notes)}
                </p>
              `
              : ""
          }

          <p style="margin-top:30px;color:#696969;font-size:12px;">
            Production restaurant recipient:
            ${escapeHtml(RESTAURANT_EMAIL)}
          </p>
        </div>
      `,
    });

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data;
}

export async function sendCustomerOrderConfirmation(
  order: OrderEmailData
) {
  const itemsHtml =
    createItemsHtml(order.items);

  const { data, error } =
    await resend.emails.send({
      from: EMAIL_FROM,

      // TEMPORARY DEVELOPMENT REDIRECT.
      // Change this to order.customer.email
      // after the restaurant domain is verified.
      to: [order.customer.email],

      replyTo: RESTAURANT_EMAIL,

      subject:
        `We received your order - ${order.reference}`,

      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;line-height:1.6;color:#151313;">
          <h1 style="color:#321B29;">
            Thank you, ${escapeHtml(order.customer.name)}
          </h1>

          <p>
            We have received your order request at
            African Restaurant Estonia.
          </p>

          <p>
            <strong>Order reference:</strong>
            ${escapeHtml(order.reference)}
          </p>

          ${itemsHtml}

          <p style="font-size:20px;font-weight:700;color:#321B29;">
            Subtotal: €${order.subtotal.toFixed(2)}
          </p>

          <p>
            ${
              order.fulfilment === "delivery"
                ? "The restaurant will confirm your order and any applicable delivery charge."
                : "The restaurant will confirm your order and pickup details."
            }
          </p>

          <p>
            Please keep your order reference when
            continuing the conversation on WhatsApp.
          </p>

          <p style="margin-top:30px;">
            African Restaurant Estonia
          </p>
        </div>
      `,
    });

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data;
}

