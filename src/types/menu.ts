export type MenuSize = {
  label: string;
  price?: number;
};

export type MenuAddOn = {
  name: string;
  price?: number;
};

export type MenuCategory =
  | "STARTER"
  | "MAIN DISH"
  | "SOUP"
  | "CHEF'S SPECIAL"
  | "DRINKS"
  | "SNACKS"
  | "PROTEIN"
  | "SAUCE"
  | "SWALLOW/FUFU"
  | "VEGAN OPTIONS"
  | "COMBO OPTIONS";

export type MenuItem = {
  id: string;

  name: string;

  estonianName?: string;

  description?: string;

  category: MenuCategory;

  sizes: MenuSize[];

  addOns?: MenuAddOn[];

  tags?: MenuCategory[];

  available: boolean;

  pricePending?: boolean;

  image?: string;

  imagePublicId?: string;

  isTodayMenu?: boolean;

  isChefSpecial?: boolean;

  isVegan?: boolean;

  isCombo?: boolean;

  archived?: boolean;
};
