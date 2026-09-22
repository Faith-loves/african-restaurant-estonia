import { MenuCategory, MenuItem } from "@/types/menu";

type SizeSeed = [label: string, price?: number];
type AddOnSeed = [name: string, price?: number];

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

    ...(addOns &&
    addOns.length > 0
      ? {
          addOns: addOns.map(
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
      addOns: [
        ["VEGETABLE SALAD", 4.5],
        ["FRIED PLANTAINS", 5],
      ],
      tags: ["VEGAN OPTIONS"],
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
    "Bean Cake",
    "MAIN DISH",
    [
      ["Medium"],
      ["Large"],
    ],
    {
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
    "Bean Pudding",
    "MAIN DISH",
    [
      ["Medium"],
      ["Large"],
    ],
    {
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
    "oha-soup",
    "Oha Soup",
    "SOUP",
    [
      ["Small"],
      ["Medium"],
    ],
    {
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
    "peppered-turkey",
    "Peppered Turkey",
    "PROTEIN",
    [
      ["Small", 7.5],
      ["Medium", 15],
      ["Large", 30],
    ],
    {
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
    "nkwobi",
    "Nkwobi",
    "PROTEIN",
    [
      ["Medium"],
      ["Large"],
    ],
    {
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
    "egg-sauce",
    "Egg Sauce",
    "SAUCE",
    [
      ["Small", 8],
      ["Medium", 13],
      ["Large", 17],
    ],
    {
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
      available: false,
      pricePending: true,
    }
  ),

  /*
    Rows 7-12 are listed under VEGAN OPTIONS in the client's
    combo sheet, but they contain chicken, turkey and fish.

    We preserve the combo names but DO NOT mark them as vegan.
  */

  m(
    "combo-jollof-chicken-plantain-zobo-7",
    "Jollof + Chicken + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-jollof-turkey-plantain-zobo-8",
    "Jollof + Turkey + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-jollof-fish-plantain-zobo-9",
    "Jollof + Fish + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-fried-rice-chicken-plantain-zobo-10",
    "Fried Rice + Chicken + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-fried-rice-turkey-plantain-zobo-11",
    "Fried Rice + Turkey + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
      available: false,
      pricePending: true,
    }
  ),

  m(
    "combo-fried-rice-fish-plantain-zobo-12",
    "Fried Rice + Fish + Plantain + Zobo",
    "COMBO OPTIONS",
    [],
    {
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
      available: false,
      pricePending: true,
    }
  ),
];

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

export const restaurantDrinkAddOns = [
  {
    name: "Zobo",
    price: 3.5,
  },
  {
    name: "Ginger Juice",
    price: 3.5,
  },
];
