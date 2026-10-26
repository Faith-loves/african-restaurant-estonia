export type CateringServiceType =
  | "corporate"
  | "event"
  | "gift-box"
  | "bulk-order";

export type CateringRequest = {
  serviceType: CateringServiceType;

  name: string;
  phone: string;
  email: string;

  companyName?: string;
  eventType?: string;

  date: string;
  guestCount?: number;
  quantityLitres?: 3 | 5;

  location: string;
  budget?: string;

  recipientName?: string;
  recipientPhone?: string;
  giftMessage?: string;

  selectedMenuItems: string[];

  additionalFood?: string;

  notes?: string;
};
