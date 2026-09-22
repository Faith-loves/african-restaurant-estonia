export type CartAddOn = {
  name: string;
  price: number;
};

export type CartItem = {
  id: string;
  menuItemId: string;
  name: string;
  estonianName?: string;
  image?: string;

  size: {
    label: string;
    price: number;
  };

  addOns: CartAddOn[];

  quantity: number;
};
