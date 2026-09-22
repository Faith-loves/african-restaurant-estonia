export type FulfilmentType = "pickup" | "delivery";

export type OrderDetails = {
  fulfilment: FulfilmentType;

  name: string;
  phone: string;
  email: string;

  address?: string;
  city?: string;
  postalCode?: string;

  orderingForSomeoneElse: boolean;

  recipientName?: string;
  recipientPhone?: string;

  notes?: string;
};
