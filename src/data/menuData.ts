import { MenuCategory, MenuItem } from "@/types/menu";

type SizeSeed = [label: string, price?: number];
type AddOnSeed = [name: string, price?: number];

export const restaurantDrinkAddOns = [
  { name: "Ginger Drink" },
  { name: "Malt" },
  { name: "Coca-Cola Can" },
  { name: "Zobo" },
] as const;

export function isHiddenMenuCategory(value: unknown) {
  return value === "SWALLOW/FUFU";
}

// These IDs were an accidental duplicate import of the first six combos.
// Keep them here so readers can ignore stale Firestore docs until sync removes them.
export const legacyDuplicateComboIds = [
  "combo-jollof-chicken-plantain-zobo-7",
  "combo-jollof-turkey-plantain-zobo-8",
  "combo-jollof-fish-plantain-zobo-9",
  "combo-fried-rice-chicken-plantain-zobo-10",
  "combo-fried-rice-turkey-plantain-zobo-11",
  "combo-fried-rice-fish-plantain-zobo-12",
] as const;

type MenuSeedOptions = {
  estonianName?: string;
  description?: string;
  addOns?: AddOnSeed[];
  tags?: MenuCategory[];
  available?: boolean;
  pricePending?: boolean;
  image?: string;
};

function m(
  id: string,
  name: string,
  category: MenuCategory,
  sizes: SizeSeed[],
  options: MenuSeedOptions = {}
): MenuItem {
  const {
    addOns,
    available = true,
    ...rest
  } = options;

  const allAddOns = category === "DRINKS"
    ? addOns ?? []
    : [
        ...(addOns ?? []),
        ...restaurantDrinkAddOns.map((drink) => [drink.name] as AddOnSeed),
      ];

  return {
    id,
    name,
    category,

    sizes: sizes.map(
      ([label, price]) => ({
        label,
        ...(price !== undefined
          ? { price }
          : {}),
      })
    ),

    ...(allAddOns.length > 0
      ? {
          addOns: allAddOns.map(
            ([name, price]) => ({
              name,
              ...(price !==
              undefined
                ? { price }
                : {}),
            })
          ),
        }
      : {}),

    available,
    ...rest,
  };
}

/*
  AFRICAN RESTAURANT ESTONIA MENU

  Synced from:
  - MENU
  - MENU WITH PRICE

  Rules:
  - Only prices actually supplied in the Excel are used.
  - Missing prices are never invented.
  - Unpriced meals stay visible with pricePending: true.
  - Combo prices are currently absent from the spreadsheet.
  - Vegan rows duplicated in the price sheet are represented as tags
    instead of creating duplicate food cards.
  - Chef's Special will later be selected from the admin panel.
*/

export const menuItems: MenuItem[] = [

  // =========================================================
  // RICE / MAIN DISHES
  // =========================================================

  m(
    "jollof-rice",
    "Jollof Rice",
    "MAIN DISH",
    [
      ["Small", 9.5],
      ["Medium", 11.5],
      ["Large", 14.5],
    ],
    {
      estonianName: "Jollof-riis",
      description:
        "Aromatic Nigerian jollof rice cooked in a rich tomato and pepper sauce with onions and traditional spices.",
      image: "/images/foods/jollof-rice.jpg",
      addOns: [
        ["VEGETABLE SALAD", 4.5],
        ["FRIED PLANTAINS", 5],
      ],
    }
  ),

  m(
    "fried-rice",
    "Fried Rice",
    "MAIN DISH",
    [
      ["Small", 10],
      ["Medium", 12],
      ["Large", 15],
    ],
    {
      estonianName:
        "Praetud riis",
      description:
        "Aromatic fried rice with mixed vegetables, onions and Nigerian-style seasoning.",
      image: "/images/foods/fried-rice.jpg",
      addOns: [
        ["VEGETABLE SALAD", 4.5],
        ["FRIED PLANTAINS", 5],
      ],
    }
  ),

  m(
    "vegan-jollof-rice",
    "Vegan Jollof Rice",
    "VEGAN OPTIONS",
    [
      ["Small", 9.5],
      ["Medium", 11.5],
      ["Large", 14.5],
    ],
    {
      image: "/images/foods/vegan-jollof.jpg",
      description:
        "A vibrant plant-based jollof rice prepared with rich tomato, pepper and traditional West African spices.",
      addOns: [
        ["VEGETABLE SALAD", 4.5],
        ["FRIED PLANTAINS", 5],
      ],
      tags: ["VEGAN OPTIONS"],
    }
  ),

  m(
    "vegan-fried-rice",
    "Vegan Fried Rice",
    "VEGAN OPTIONS",
    [
      ["Small", 10],
      ["Medium", 12],
      ["Large", 15],
    ],
    {
      image: "/images/foods/vegan-fried-rice.jpg",
      description:
        "Plant-based fried rice with mixed vegetables and Nigerian-style seasoning.",
      addOns: [
        ["VEGETABLE SALAD", 4.5],
        ["FRIED PLANTAINS", 5],
      ],
      tags: ["VEGAN OPTIONS"],
    }
  ),

  m(
    "rice-and-beans",
    "Rice and Beans",
    "MAIN DISH",
    [
      ["Small"],
      ["Medium"],
      ["Large"],
    ],
    {
      image: "/images/foods/rice-and-beans.jpg",
      addOns: [
        ["VEGETABLE SALAD"],
        ["FRIED PLANTAINS"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "coconut-rice",
    "Coconut Rice",
    "MAIN DISH",
    [
      ["Small"],
      ["Medium"],
      ["Large"],
    ],
    {
      image: "/images/foods/coconut-rice.jpg",
      addOns: [
        ["VEGETABLE SALAD"],
        ["FRIED PLANTAINS"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "plain-rice",
    "Plain Rice",
    "MAIN DISH",
    [
      ["Small"],
      ["Medium"],
      ["Large"],
    ],
    {
      image: "/images/foods/plain-rice.jpg",
      addOns: [
        ["VEGETABLE SALAD"],
        ["FRIED PLANTAINS"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "native-jollof-rice",
    "Native Jollof Rice",
    "MAIN DISH",
    [
      ["Small"],
      ["Medium"],
      ["Large"],
    ],
    {
      image: "/images/foods/native-jollof-rice.jpg",
      addOns: [
        ["VEGETABLE SALAD"],
        ["FRIED PLANTAINS"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "seafood-fried-rice",
    "Seafood Fried Rice",
    "MAIN DISH",
    [
      ["Small"],
      ["Medium"],
      ["Large"],
    ],
    {
      image: "/images/foods/seafood-fried-rice.jpg",
      addOns: [
        ["VEGETABLE SALAD"],
        ["FRIED PLANTAINS"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "ofada-rice",
    "Ofada Rice",
    "MAIN DISH",
    [
      ["Small"],
      ["Medium"],
      ["Large"],
    ],
    {
      image: "/images/foods/ofada-rice.jpg",
      addOns: [
        ["VEGETABLE SALAD"],
        ["FRIED PLANTAINS"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "ewa-agoyin",
    "Ewa Agoyin",
    "MAIN DISH",
    [],
    {
      image: "/images/foods/ewa-agoyin.jpg",
      addOns: [
        ["FRIED PLANTAIN"],
        ["AGEGE BREAD"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "porridge-beans",
    "Porridge Beans",
    "MAIN DISH",
    [],
    {
      image: "/images/foods/porridge-beans.jpg",
      addOns: [
        ["PLAIN"],
        ["PROTEINS"],
        ["YAM"],
        ["POTATOES"],
        ["FRIED PLANTAIN"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "fried-yam",
    "Fried Yam",
    "MAIN DISH",
    [
      ["Medium", 9.5],
      ["Large", 15],
    ],
    {
      image: "/images/foods/fried-yam.jpg",
      estonianName:
        "Praetud jamss",
      description:
        "Golden yam pieces fried until tender inside and deliciously crisp outside.",
      addOns: [
        ["EGG SAUCE", 10],
        ["FISH SAUCE", 12],
        ["BEEF SAUCE", 12],
      ],
    }
  ),

  m(
    "boiled-yam",
    "Boiled Yam",
    "MAIN DISH",
    [
      ["Medium", 9],
      ["Large", 14.5],
    ],
    {
      image: "/images/foods/boiled-yam.jpg",
      estonianName:
        "Keedetud jamss",
      description:
        "Tender boiled yam with a soft, satisfying texture, perfect with Nigerian sauces.",
      addOns: [
        ["EGG SAUCE", 10],
        ["FISH SAUCE", 12],
        ["BEEF SAUCE", 12],
      ],
    }
  ),

  m(
    "yam-porridge",
    "Yam Porridge",
    "MAIN DISH",
    [
      ["Medium", 12],
      ["Large", 16],
    ],
    {
      image: "/images/foods/yam-porridge.jpg",
      estonianName:
        "Jamsipuder",
      description:
        "Tender yam cooked in a rich tomato and pepper sauce with onions and aromatic spices.",
      addOns: [
        ["FRIED PLANTAINS", 5],
      ],
    }
  ),

  m(
    "fried-plantain",
    "Fried Plantain",
    "MAIN DISH",
    [
      ["Small", 5],
      ["Medium", 10],
      ["Large", 20],
    ],
    {
      image: "/images/foods/vegan-plantain.jpg",
      estonianName:
        "Praetud jahubanaan",
      description:
        "Ripe plantain slices fried until golden, sweet and deliciously caramelised.",
      addOns: [
        ["FRIED YAM", 9.5],
        ["EGG SAUCE", 10],
        ["FISH SAUCE", 12],
        ["BEEF SAUCE", 12],
      ],
      tags: ["VEGAN OPTIONS"],
    }
  ),

  m(
    "roasted-plantains",
    "Roasted Plantains",
    "MAIN DISH",
    [
      ["Medium", 11],
      ["Large", 22],
    ],
    {
      image: "/images/foods/roasted-plantains.jpg",
      estonianName:
        "Röstitud jahubanaanid",
      description:
        "Ripe plantains roasted until tender with a delicious naturally sweet and lightly smoky flavour.",
      addOns: [
        ["FRIED YAM", 9.5],
        ["EGG SAUCE", 10],
        ["FISH SAUCE", 12],
        ["BEEF SAUCE", 12],
      ],
      tags: ["VEGAN OPTIONS"],
    }
  ),

  m(
    "boiled-plantains",
    "Boiled Plantains",
    "MAIN DISH",
    [
      ["Small", 4.5],
      ["Medium", 9],
      ["Large", 18],
    ],
    {
      image: "/images/foods/boiled-plantain.jpg",
      estonianName:
        "Keedetud jahubanaanid",
      description:
        "Soft boiled ripe plantains with a naturally sweet and satisfying flavour.",
      addOns: [
        ["EGG SAUCE", 10],
        ["FISH SAUCE", 12],
        ["BEEF SAUCE", 12],
      ],
      tags: ["VEGAN OPTIONS"],
    }
  ),

  m(
    "bean-cake",
    "Beans Cake (Akara)",
    "MAIN DISH",
    [
      ["Medium"],
      ["Large"],
    ],
    {
      image: "/images/foods/akara.jpg",
      addOns: [
        ["PAP"],
        ["CUSTARD"],
        ["MILK"],
        ["SUGAR"],
        ["AGEGE BREAD"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "bean-pudding",
    "Bean Pudding (Moi Moi)",
    "MAIN DISH",
    [
      ["Medium"],
      ["Large"],
    ],
    {
      image: "/images/foods/moi-moi.jpg",
      addOns: [
        ["PAP"],
        ["CUSTARD"],
        ["MILK"],
        ["SUGAR"],
        ["AGEGE BREAD"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  // =========================================================
  // PEPPER SOUPS / STARTERS
  // =========================================================

  m(
    "goat-meat-peppersoup",
    "Goat Meat Peppersoup",
    "STARTER",
    [
      ["Medium", 18],
      ["Large", 22],
    ],
    {
      estonianName:
        "Kitselihasupp",
      description:
        "Tender goat meat simmered in a delicious aromatic Nigerian pepper soup with traditional spices.",
      image: "/images/foods/goat-meat-pepper-soup.jpg",
      addOns: [
        ["PLAIN", 0],
        ["UNRIPE PLANTAIN", 5],
        ["YAM", 5],
        ["POTATOES", 4.5],
        ["PLAIN RICE", 5.5],
        ["RIPE PLANTAIN", 5],
      ],
    }
  ),

  m(
    "chicken-peppersoup",
    "Chicken Peppersoup",
    "STARTER",
    [
      ["Medium", 15],
      ["Large", 18],
    ],
    {
      image: "/images/foods/chicken-peppersoup.jpg",
      estonianName:
        "Kanasupp",
      description:
        "Tender chicken simmered in a delicious aromatic Nigerian pepper soup with traditional spices.",
      addOns: [
        ["PLAIN", 0],
        ["UNRIPE PLANTAIN", 5],
        ["YAM", 5],
        ["POTATOES", 4.5],
        ["PLAIN RICE", 5.5],
        ["RIPE PLANTAIN", 5],
      ],
    }
  ),

  m(
    "beefmix-peppersoup",
    "Beef Mix Peppersoup",
    "STARTER",
    [
      ["Medium", 16],
      ["Large", 20],
    ],
    {
      image: "/images/foods/beef-mix-peppersoup.jpg",
      estonianName:
        "Veiseliha segupiprasupp",
      description:
        "A delicious mix of tender beef simmered in an aromatic Nigerian pepper soup with traditional spices.",
      addOns: [
        ["PLAIN", 0],
        ["UNRIPE PLANTAIN", 5],
        ["YAM", 5],
        ["POTATOES", 4.5],
        ["PLAIN RICE", 5.5],
        ["RIPE PLANTAIN", 5],
      ],
    }
  ),

  m(
    "tilapia-peppersoup",
    "Tilapia Peppersoup",
    "STARTER",
    [
      ["Medium", 15],
      ["Large", 20],
    ],
    {
      image: "/images/foods/tilapia-peppersoup.jpg",
      estonianName:
        "Tilapia piprasupp",
      description:
        "Tender tilapia cooked in a delicious aromatic Nigerian pepper soup with traditional spices.",
      addOns: [
        ["PLAIN", 0],
        ["UNRIPE PLANTAIN", 5],
        ["YAM", 5],
        ["POTATOES", 4.5],
        ["PLAIN RICE", 5.5],
        ["RIPE PLANTAIN", 5],
      ],
    }
  ),

  m(
    "turkey-peppersoup",
    "Turkey Peppersoup",
    "STARTER",
    [
      ["Medium", 16],
      ["Large", 19],
    ],
    {
      image: "/images/foods/turkey-peppersoup.jpg",
      estonianName:
        "Kalkunisupp",
      description:
        "Tender turkey simmered in a delicious aromatic Nigerian pepper soup with traditional spices.",
      addOns: [
        ["PLAIN", 0],
        ["UNRIPE PLANTAIN", 5],
        ["YAM", 5],
        ["POTATOES", 4.5],
        ["PLAIN RICE", 5.5],
        ["RIPE PLANTAIN", 5],
      ],
    }
  ),

  // =========================================================
  // SOUPS
  // =========================================================

  m(
    "egusi-soup",
    "Egusi Soup",
    "SOUP",
    [
      ["Small", 12],
      ["Medium", 18.5],
      ["Large", 25.5],
    ],
    {
      estonianName:
        "Egusi supp",
      description:
        "Rich Nigerian Egusi soup made with ground melon seeds, leafy greens and aromatic spices.",
      image: "/images/foods/egusi.webp",
      addOns: [
        ["EBA", 5],
        ["SEMO", 5.6],
        ["POUNDO", 6],
        ["AMALA", 6],
        ["PLANTAIN FUFU", 7],
      ],
    }
  ),

  m(
    "banga",
    "Banga",
    "SOUP",
    [
      ["Small", 12],
      ["Medium", 18],
      ["Large", 25],
    ],
    {
      image: "/images/foods/banga-soup.jpg",
      estonianName:
        "Banga supp",
      description:
        "Traditional Nigerian Banga soup made with palm fruit extract, aromatic spices and rich African flavours.",
      addOns: [
        ["EBA", 5],
        ["SEMO", 5.6],
        ["POUNDO", 6],
        ["AMALA", 6],
        ["PLANTAIN FUFU", 7],
      ],
    }
  ),

  m(
    "ogbono",
    "Ogbono",
    "SOUP",
    [
      ["Small", 12],
      ["Medium", 18.5],
      ["Large", 25.5],
    ],
    {
      estonianName:
        "Ogbono supp",
      description:
        "Rich Nigerian Ogbono soup made with ground ogbono seeds, leafy vegetables and aromatic spices.",
      image: "/images/foods/ogbono-soup.jpg",
      addOns: [
        ["EBA", 5],
        ["SEMO", 5.6],
        ["POUNDO", 6],
        ["AMALA", 6],
        ["PLANTAIN FUFU", 7],
      ],
    }
  ),

  m(
    "okro-soup",
    "Okro Soup",
    "SOUP",
    [
      ["Small", 12],
      ["Medium", 18.5],
      ["Large", 25.5],
    ],
    {
      estonianName:
        "Okra supp",
      description:
        "Delicious Nigerian okra soup prepared with tender okra, vegetables and aromatic spices.",
      image: "/images/foods/okro-soup.jpg",
      addOns: [
        ["EBA", 5],
        ["SEMO", 5.6],
        ["POUNDO", 6],
        ["AMALA", 6],
        ["PLANTAIN FUFU", 7],
      ],
    }
  ),

  m(
    "seafood-okro",
    "Seafood Okro",
    "SOUP",
    [
      ["Small", 14],
      ["Medium", 21],
      ["Large", 28.5],
    ],
    {
      image: "/images/foods/seafood-okro.jpg",
      estonianName:
        "Okrasupp mereandidega",
      description:
        "Rich okra soup packed with delicious seafood, vegetables and aromatic Nigerian spices.",
      addOns: [
        ["EBA", 5],
        ["SEMO", 5.6],
        ["POUNDO", 6],
        ["AMALA", 6],
        ["PLANTAIN FUFU", 7],
      ],
    }
  ),

  m(
    "abula",
    "Abula",
    "SOUP",
    [
      ["Small"],
      ["Medium"],
    ],
    {
      image: "/images/foods/abula.jpg",
      addOns: [
        ["TOMATO SOUP"],
        ["EWEDU"],
        ["GBEGIRI"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "afang-eru",
    "Afang / Eru",
    "SOUP",
    [
      ["Small"],
      ["Medium"],
    ],
    {
      image: "/images/foods/afang.jpg",
      addOns: [
        ["EBA"],
        ["SEMO"],
        ["POUNDO"],
        ["AMALA"],
        ["PLANTAIN FUFU"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "ewedu-soup",
    "Ewedu Soup",
    "SOUP",
    [],
    {
      image: "/images/foods/ewedu.jpg",
      description:
        "Silky Nigerian jute-leaf soup, traditionally served with a choice of swallow.",
      addOns: [
        ["EBA"],
        ["SEMO"],
        ["POUNDO"],
        ["AMALA"],
        ["PLANTAIN FUFU"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "eba",
    "Eba",
    "SWALLOW/FUFU",
    [],
    { image: "/images/foods/eba.jpg", available: false, pricePending: true }
  ),

  m(
    "semo",
    "Semo",
    "SWALLOW/FUFU",
    [],
    { image: "/images/foods/semo.jpg", available: false, pricePending: true }
  ),

  m(
    "pounded-yam",
    "Pounded Yam",
    "SWALLOW/FUFU",
    [],
    { image: "/images/foods/pounded-yam.jpg", available: false, pricePending: true }
  ),

  m(
    "amala",
    "Amala",
    "SWALLOW/FUFU",
    [],
    { image: "/images/foods/amala.jpg", available: false, pricePending: true }
  ),

  m(
    "plantain-fufu",
    "Plantain Fufu",
    "SWALLOW/FUFU",
    [],
    { image: "/images/foods/plantain-fufu.jpg", available: false, pricePending: true }
  ),

  m(
    "oha-soup",
    "Oha Soup",
    "SOUP",
    [
      ["Small"],
      ["Medium"],
    ],
    {
      image: "/images/foods/oha-soup.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "achi-soup",
    "Achi Soup",
    "SOUP",
    [
      ["Small"],
      ["Medium"],
    ],
    {
      image: "/images/foods/achi-soup.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "eforiro",
    "Efo Riro",
    "SOUP",
    [
      ["Small", 12],
      ["Medium", 18.5],
      ["Large", 15.5],
    ],
    {
      estonianName:
        "Efo Riro",
      description:
        "Rich Nigerian vegetable stew made with leafy greens, peppers, tomatoes, onions and aromatic spices.",
      image: "/images/foods/efo-riro.webp",
      addOns: [
        ["EBA", 5],
        ["SEMO", 5.6],
        ["POUNDO", 6],
        ["AMALA", 6],
        ["PLANTAIN FUFU", 7],
      ],
    }
  ),

  // =========================================================
  // PASTA
  // =========================================================

  m(
    "seafood-pasta",
    "Seafood Pasta",
    "MAIN DISH",
    [
      ["Medium"],
      ["Large"],
    ],
    {
      image: "/images/foods/seafood-pasta.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "plain-pasta",
    "Plain Pasta",
    "MAIN DISH",
    [
      ["Medium"],
      ["Large"],
    ],
    {
      image: "/images/foods/plain-pasta.jpg",
      addOns: [
        ["EGG SAUCE"],
        ["FISH SAUCE"],
        ["BEEF SAUCE"],
        ["TURKEY STEW"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  // =========================================================
  // PROTEINS
  // =========================================================

  m(
    "hake",
    "Hake",
    "PROTEIN",
    [],
    {
      image: "/images/foods/hake.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "mackerel",
    "Mackerel",
    "PROTEIN",
    [],
    {
      image: "/images/foods/mackerel.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "cowleg",
    "Cow Leg (Nkwobi)",
    "PROTEIN",
    [],
    {
      image: "/images/foods/cowleg.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "peppered-turkey",
    "Peppered Turkey",
    "PROTEIN",
    [
      ["Small", 7.5],
      ["Medium", 15],
      ["Large", 30],
    ],
    {
      image: "/images/foods/peppered-turkey.jpg",
      estonianName:
        "Kalkun tomati-piprakastmes",
      description:
        "Tender turkey pieces simmered in a rich and delicious Nigerian tomato-pepper sauce with onions and aromatic spices.",
      addOns: [
        ["FRIED YAM", 9.5],
        ["FRIED PLANTAIN", 5],
        ["BOILED PLANTAIN"],
        ["BOILED POTATOES", 4.5],
        ["BOILED YAM", 9],
      ],
    }
  ),

  m(
    "peppered-chicken",
    "Peppered Chicken",
    "PROTEIN",
    [
      ["Small", 6.5],
      ["Medium", 13],
      ["Large", 26],
    ],
    {
      image: "/images/foods/fried-chicken.jpg",
      estonianName:
        "Kana tomati-piprakastmes",
      description:
        "Tender chicken pieces simmered in a rich and delicious Nigerian tomato-pepper sauce with onions and aromatic spices.",
      addOns: [
        ["FRIED YAM", 9.5],
        ["FRIED PLANTAIN", 5],
        ["BOILED PLANTAIN"],
        ["BOILED POTATOES", 4.5],
        ["BOILED YAM", 9],
      ],
    }
  ),

  m(
    "peppered-beef",
    "Peppered Beef",
    "PROTEIN",
    [
      ["Small", 10.5],
      ["Medium", 16],
      ["Large", 24],
    ],
    {
      image: "/images/foods/beef-stew.jpg",
      estonianName:
        "Veiseliha tomati-piprakastmes",
      description:
        "Tender beef cooked in a rich and delicious Nigerian tomato-pepper sauce with onions and aromatic spices.",
      addOns: [
        ["FRIED YAM", 9.5],
        ["FRIED PLANTAIN", 5],
        ["BOILED PLANTAIN"],
        ["BOILED POTATOES", 4.5],
        ["BOILED YAM", 9],
      ],
    }
  ),

  m(
    "peppered-gizzard",
    "Peppered Gizzard",
    "PROTEIN",
    [
      ["Small", 9.5],
      ["Medium", 13.5],
      ["Large", 21],
    ],
    {
      image: "/images/foods/peppered-gizzard.jpg",
      estonianName:
        "Kanapugu tomati-piprakastmes",
      description:
        "Tender chicken gizzard cooked in a rich and delicious Nigerian tomato-pepper sauce with onions and aromatic spices.",
      addOns: [
        ["FRIED YAM", 9.5],
        ["FRIED PLANTAIN", 5],
        ["BOILED PLANTAIN"],
        ["BOILED POTATOES", 4.5],
        ["BOILED YAM", 9],
      ],
    }
  ),

  m(
    "peppered-pomo",
    "Peppered Pomo",
    "PROTEIN",
    [
      ["Small", 8.5],
      ["Medium", 12.5],
      ["Large", 19.5],
    ],
    {
      image: "/images/foods/peppered-pomo.jpg",
      estonianName:
        "Pomo tomati-piprakastmes",
      description:
        "Tender cow skin cooked in a rich and delicious Nigerian tomato-pepper sauce with onions and aromatic spices.",
      addOns: [
        ["FRIED YAM", 9.5],
        ["FRIED PLANTAIN", 5],
        ["BOILED PLANTAIN"],
        ["BOILED POTATOES", 4.5],
        ["BOILED YAM", 9],
      ],
    }
  ),

  m(
    "peppered-fish",
    "Peppered Fish",
    "PROTEIN",
    [
      ["Small", 10.5],
      ["Medium", 16.5],
      ["Large", 24.5],
    ],
    {
      image: "/images/foods/peppered-fish.jpg",
      estonianName:
        "Kala tomati-piprakastmes",
      description:
        "Tender fish cooked in a rich and delicious Nigerian tomato-pepper sauce with onions and aromatic spices.",
      addOns: [
        ["FRIED YAM", 9.5],
        ["FRIED PLANTAIN", 5],
        ["BOILED PLANTAIN"],
        ["BOILED POTATOES", 4.5],
        ["BOILED YAM", 9],
      ],
    }
  ),

  m(
    "fried-fish",
    "Fried Fish",
    "PROTEIN",
    [],
    {
      image: "/images/foods/fried-fish.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "nkwobi",
    "Nkwobi",
    "PROTEIN",
    [
      ["Medium"],
      ["Large"],
    ],
    {
      image: "/images/foods/nkwobi.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "bbq-catfish",
    "BBQ Catfish",
    "PROTEIN",
    [],
    {
      image: "/images/foods/bbq-catfish.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "bbq-tilapia",
    "BBQ Tilapia",
    "PROTEIN",
    [],
    {
      image: "/images/foods/bbq-tilapia.jpg",
      available: false,
      pricePending: true,
    }
  ),

  // =========================================================
  // SNACKS
  // =========================================================

  m(
    "gizdodo",
    "Gizdodo",
    "SNACKS",
    [
      ["Small", 15],
      ["Medium", 23.5],
      ["Large", 32],
    ],
    {
      image: "/images/foods/gizzard-plantain.jpg",
      estonianName: "Gizdodo",
      description:
        "A delicious Nigerian dish combining tender chicken gizzard and ripe plantain in a rich, aromatic pepper sauce.",
      addOns: [
        ["FRIED YAM", 9.5],
        ["FRIED PLANTAIN", 5],
        ["BOILED PLANTAIN"],
        ["BOILED POTATOES", 4.5],
        ["BOILED YAM", 9],
      ],
    }
  ),

  m(
    "puff-puff",
    "Puff Puff",
    "SNACKS",
    [
      ["10 pcs", 10],
      ["20 pcs", 16],
      ["30 pcs", 25],
    ],
    {
      image: "/images/foods/puff-puff.jpg",
      estonianName:
        "Puff Puff",
      description:
        "Soft, fluffy Nigerian dough balls fried until golden and lightly sweet.",
      tags: ["VEGAN OPTIONS"],
    }
  ),

  m(
    "meat-pie",
    "Meat Pie",
    "SNACKS",
    [
      ["10 pcs", 40],
      ["20 pcs", 70],
      ["30 pcs", 110],
    ],
    {
      image: "/images/foods/meat-pie-nigerian.jpg",
      estonianName:
        "Lihapirukas",
      description:
        "Golden pastry filled with a savoury and delicious seasoned meat filling.",
    }
  ),

  m(
    "spring-rolls",
    "Spring Rolls",
    "SNACKS",
    [
      ["10 pcs", 10],
      ["20 pcs", 18],
      ["30 pcs", 25],
    ],
    {
      image: "/images/foods/spring-rolls.jpg",
      estonianName:
        "Kevadrullid",
      description:
        "Crispy spring rolls filled with a delicious savoury vegetable filling.",
    }
  ),

  m(
    "fish-pie",
    "Fish Pie",
    "SNACKS",
    [
      ["10 pcs", 40],
      ["20 pcs", 70],
      ["30 pcs", 110],
    ],
    {
      image: "/images/foods/fish-pie.jpg",
      estonianName:
        "Kalapirukas",
      description:
        "Golden pastry filled with a savoury, delicious seasoned fish filling.",
    }
  ),

  m(
    "chin-chin",
    "Chin Chin",
    "SNACKS",
    [
      ["Small", 12],
      ["Medium", 18],
      ["Large (2 litre)", 25],
    ],
    {
      image: "/images/foods/chin-chin.jpg",
      estonianName:
        "Chin Chin",
      description:
        "Crunchy Nigerian fried pastry bites with a delicious lightly sweet flavour.",
    }
  ),

  m(
    "peanuts",
    "Peanuts",
    "SNACKS",
    [],
    {
      image: "/images/foods/peanuts.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "chicken-pie",
    "Chicken Pie",
    "SNACKS",
    [
      ["10 pcs", 40],
      ["20 pcs", 70],
      ["30 pcs", 110],
    ],
    {
      image: "/images/foods/chicken-pie.jpg",
      estonianName:
        "Kanapirukas",
      description:
        "Golden pastry filled with a delicious seasoned chicken filling.",
    }
  ),

  // =========================================================
  // SAUCES
  // =========================================================

  m(
    "ginger-juice",
    "Ginger Juice",
    "DRINKS",
    [],
    {
      image: "/images/foods/ginger-juice.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "malta-guinness",
    "Malta Guinness",
    "DRINKS",
    [],
    {
      image: "/images/foods/malta-guinness.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "capri-sun",
    "Capri-Sun Orange",
    "DRINKS",
    [],
    {
      image: "/images/foods/capri-sun.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "coca-cola-can",
    "Coca-Cola Can",
    "DRINKS",
    [],
    {
      image: "/images/foods/coca-cola.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "egg-sauce",
    "Egg Sauce",
    "SAUCE",
    [
      ["Small", 8],
      ["Medium", 13],
      ["Large", 17],
    ],
    {
      image: "/images/foods/egg-sauce.jpg",
      estonianName:
        "Munakaste",
      description:
        "Eggs cooked in a rich tomato and pepper sauce with onions and aromatic spices.",
      addOns: [
        ["BOILED YAM", 9],
        ["FRIED YAM", 9.5],
        ["BOILED PLANTAIN", 4.5],
        ["BOILED POTATOES", 4.5],
      ],
    }
  ),

  m(
    "fish-sauce",
    "Fish Sauce",
    "SAUCE",
    [
      ["Small", 9.5],
      ["Medium", 14],
      ["Large", 19],
    ],
    {
      image: "/images/foods/fish-sauce.jpg",
      estonianName:
        "Kalakaste",
      description:
        "Tender fish cooked in a rich Nigerian tomato and pepper sauce with onions and aromatic spices.",
      addOns: [
        ["BOILED YAM", 9],
        ["FRIED YAM", 9.5],
        ["BOILED PLANTAIN", 4.5],
        ["BOILED POTATOES", 4.5],
      ],
    }
  ),

  m(
    "ugba-sauce",
    "Ugba Sauce",
    "SAUCE",
    [],
    {
      image: "/images/foods/ugba-sauce.jpg",
      addOns: [
        ["BOILED YAM"],
        ["FRIED YAM"],
        ["FRITATA"],
        ["BOILED PLANTAIN"],
        ["BOILED POTATOES"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "garden-egg-sauce",
    "Garden Egg Sauce",
    "SAUCE",
    [],
    {
      image: "/images/foods/garden-egg-sauce.jpg",
      addOns: [
        ["BOILED YAM"],
        ["FRIED YAM"],
        ["FRITATA"],
        ["BOILED PLANTAIN"],
        ["BOILED POTATOES"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "ewa-agoyin-sauce",
    "Ewa Agoyin Sauce",
    "SAUCE",
    [],
    {
      image: "/images/foods/ewa-agoyin-sauce.jpg",
      addOns: [
        ["EWA AGOYIN BEANS"],
        ["AGEGE BREAD"],
        ["PLANTAIN"],
      ],
      available: false,
      pricePending: true,
    }
  ),

  m(
    "ofada-sauce",
    "Ofada Sauce",
    "SAUCE",
    [
      ["Small", 15.5],
      ["Medium", 23],
      ["Large", 32],
    ],
    {
      image: "/images/foods/ofada-sauce.jpg",
      estonianName:
        "Ofada kaste",
      description:
        "Traditional Nigerian green pepper sauce with a rich, savoury flavour and aromatic spices.",
      addOns: [
        ["PLAIN RICE", 5.5],
        ["OFADA RICE", 8],
      ],
    }
  ),

  m(
    "ayamase-sauce",
    "Ayamase Sauce",
    "SAUCE",
    [
      ["Small", 15.5],
      ["Medium", 23],
      ["Large", 32],
    ],
    {
      image: "/images/foods/ayamase-sauce.jpg",
      estonianName:
        "Ayamase kaste",
      description:
        "Delicious Nigerian green pepper sauce prepared with onions and aromatic spices.",
      addOns: [
        ["PLAIN RICE", 5.5],
        ["OFADA RICE", 8],
      ],
    }
  ),

  // =========================================================
  // OTHER MAIN DISHES
  // =========================================================

  m(
    "abacha",
    "Abacha",
    "MAIN DISH",
    [],
    {
      image: "/images/foods/abacha.jpg",
      available: false,
      pricePending: true,
    }
  ),

  // =========================================================
  // COMBO OPTIONS
  // Prices are not provided in the client's spreadsheet.
  // =========================================================

  m(
    "combo-jollof-chicken-plantain-zobo-1",
    "Jollof + Chicken + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/jollof-chicken-plantain.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-jollof-turkey-plantain-zobo-2",
    "Jollof + Turkey + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/peppered-turkey.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-jollof-fish-plantain-zobo-3",
    "Jollof + Fish + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/fried-fish.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-fried-rice-chicken-plantain-zobo-4",
    "Fried Rice + Chicken + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/fried-rice-chicken.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-fried-rice-turkey-plantain-zobo-5",
    "Fried Rice + Turkey + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/peppered-turkey.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-fried-rice-fish-plantain-zobo-6",
    "Fried Rice + Fish + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/fried-fish.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-peppered-fish-plantain-zobo-13",
    "Peppered Fish + Fried Plantains + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/peppered-fish.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-peppered-beef-plantain-zobo-14",
    "Peppered Beef + Fried Plantains + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/peppered-beef.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-beef-peppersoup-plantain-zobo-15",
    "Mix Beef Peppersoup + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/beef-mix-peppersoup.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-turkey-peppersoup-plantain-zobo-16",
    "Turkey Peppersoup + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/turkey-peppersoup.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-puffpuff-jollof-chicken-plantain-zobo-17",
    "Puff Puff + Jollof + Chicken + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/jollof-chicken-plantain.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-puffpuff-friedrice-chicken-plantain-zobo-18",
    "Puff Puff + Fried Rice + Chicken + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/fried-rice-chicken.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-egusi-beef-eba-zobo-19",
    "Egusi Soup + Beef + Eba + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/egusi-soup-eba.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-egusi-beef-poundo-zobo-20",
    "Egusi Soup + Beef + Poundo + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/egusi-soup-pounded-yam.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-okro-beef-poundo-zobo-21",
    "Okro Soup + Beef + Poundo + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/okro-soup.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-okro-beef-eba-zobo-22",
    "Okro Soup + Beef + Eba + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/okro-soup.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-fried-yam-plantain-tomato-zobo-23",
    "Fried Yam + Fried Plantain + Tomato Sauce + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/tomato-sauce.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-noodles-egg-zobo-24",
    "Noodles + Fried Egg + Zobo",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/noodles.jpg",
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-noodles-egg-zobo-puffpuff-25",
    "Noodles + Fried Egg + Zobo + Puff Puff",
    "COMBO OPTIONS",
    [],
    {
      image: "/images/foods/noodles.jpg",
      available: false,
      pricePending: true,
    }
  ),
];

export const menuImageById: Record<string, string> = Object.fromEntries(
  menuItems.flatMap((item) =>
    item.image ? [[item.id, item.image]] : []
  )
);

/*
  Restaurant-wide extras supplied separately in the Excel.
  We are keeping them here for the later admin/order rules instead
  of automatically attaching them to every meal.
*/

export const restaurantProteinAddOns = [
  {
    name: "Chicken — 1 pc",
    price: 2.5,
  },
  {
    name: "Turkey — 1 pc",
    price: 3,
  },
  {
    name: "Beef — 1 portion",
    price: 5,
  },
  {
    name: "Hake — 1 pc",
    price: 4,
  },
  {
    name: "Mackerel — 1 pc",
    price: 4.5,
  },
  {
    name: "Cowleg — 1 portion",
    price: 5,
  },
];
