export type CateringServiceType =
  | "corporate"
  | "event"
  | "gift-box";

export type CateringRequest = {
  serviceType: CateringServiceType;

  name: string;
  phone: string;
  email: string;

  companyName?: string;
  eventType?: string;

  date: string;
  guestCount?: number;

  location: string;
  budget?: string;

  recipientName?: string;
  recipientPhone?: string;
  giftMessage?: string;

  selectedMenuItems: string[];

  additionalFood?: string;

  notes?: string;
};
