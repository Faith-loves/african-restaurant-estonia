export const supportedLanguages = ["en", "et", "fi", "ru"] as const;

export type Language = (typeof supportedLanguages)[number];

type TranslationKey =
  | "nav.home"
  | "nav.menu"
  | "nav.about"
  | "nav.catering"
  | "nav.contact"
  | "nav.market"
  | "nav.startOrder"
  | "nav.login"
  | "nav.signIn"
  | "nav.account"
  | "nav.exitGuest"
  | "nav.exitGuestSession"
  | "nav.logout"
  | "nav.openMenu"
  | "nav.closeMenu"
  | "nav.language"
  | "hero.eyebrow"
  | "hero.titleLine1"
  | "hero.titleLine2"
  | "hero.titleLine3"
  | "hero.description"
  | "hero.startOrder"
  | "hero.todayMenu"
  | "hero.delivery"
  | "hero.pickup"
  | "hero.cateringEyebrow"
  | "hero.cateringTitle"
  | "hero.cateringDescription"
  | "hero.exploreCatering"
  | "hero.previous"
  | "hero.next"
  | "hero.slide"
  | "market.comingSoon"
  | "market.eyebrow"
  | "market.title"
  | "market.description"
  | "market.status"
  | "market.launch"
  | "market.label"
  | "install.title"
  | "install.description"
  | "install.install"
  | "install.notNow"
  | "install.iosDescription"
  | "install.iosAction"
  | "install.close";

type TranslationSet = Record<TranslationKey, string>;

const english: TranslationSet = {
  "nav.home": "Home",
  "nav.menu": "Menu",
  "nav.about": "About",
  "nav.catering": "Catering",
  "nav.contact": "Contact",
  "nav.market": "Market",
  "nav.startOrder": "Start Order",
  "nav.login": "Login",
  "nav.signIn": "Sign In",
  "nav.account": "Account",
  "nav.exitGuest": "Exit Guest",
  "nav.exitGuestSession": "Exit Guest Session",
  "nav.logout": "Log out",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",
  "nav.language": "Language",
  "hero.eyebrow": "Authentic Flavours. Real Culture.",
  "hero.titleLine1": "A Taste of",
  "hero.titleLine2": "West Africa,",
  "hero.titleLine3": "Right Here.",
  "hero.description": "Authentic Nigerian & West African food in Tallinn. Freshly prepared with bold flavours, familiar tastes, and the warmth of home.",
  "hero.startOrder": "Start Order",
  "hero.todayMenu": "View Today’s Menu",
  "hero.delivery": "Delivery Available",
  "hero.pickup": "Pickup Available",
  "hero.cateringEyebrow": "CATERING BY AFRICAN RESTAURANT ESTONIA",
  "hero.cateringTitle": "Bring the Taste of West Africa to Your Event",
  "hero.cateringDescription": "From intimate gatherings to special celebrations, let us serve authentic West African flavours your guests will remember.",
  "hero.exploreCatering": "Explore Catering",
  "hero.previous": "Previous slide",
  "hero.next": "Next slide",
  "hero.slide": "Go to slide",
  "market.comingSoon": "Coming Soon",
  "market.eyebrow": "ARE Market",
  "market.title": "A Little More of Africa, Coming to Your Home.",
  "market.description": "African Restaurant Estonia is preparing a market experience where customers will be able to discover selected African food products and restaurant favourites beyond the regular menu.",
  "market.status": "Status",
  "market.launch": "Market Launch Coming Soon",
  "market.label": "ARE Market",
  "install.title": "Get African Restaurant Estonia on your phone",
  "install.description": "Install for quicker ordering and easy access.",
  "install.install": "Install",
  "install.notNow": "Not now",
  "install.iosDescription": "To install: tap Share, then Add to Home Screen.",
  "install.iosAction": "Got it",
  "install.close": "Close install reminder",
};

export const translations: Record<Language, TranslationSet> = {
  en: english,
  et: {
    ...english,
    "nav.home": "Avaleht",
    "nav.menu": "Menüü",
    "nav.about": "Meist",
    "nav.catering": "Catering",
    "nav.contact": "Kontakt",
    "nav.market": "Turg",
    "nav.startOrder": "Alusta tellimust",
    "nav.login": "Logi sisse",
    "nav.signIn": "Logi sisse",
    "nav.account": "Konto",
    "nav.exitGuest": "Välju külalisena",
    "nav.exitGuestSession": "Lõpeta külaliseanss",
    "nav.logout": "Logi välja",
    "nav.openMenu": "Ava menüü",
    "nav.closeMenu": "Sulge menüü",
    "nav.language": "Keel",
    "hero.eyebrow": "Autentsed maitsed. Päris kultuur.",
    "hero.titleLine1": "Lääne-Aafrika",
    "hero.titleLine2": "maitse",
    "hero.titleLine3": "siinsamas.",
    "hero.description": "Autentsed Nigeeria ja Lääne-Aafrika road Tallinnas. Värskelt valmistatud julgete maitsete, tuttavate hõrgutiste ja kodusoojusega.",
    "hero.startOrder": "Alusta tellimust",
    "hero.todayMenu": "Vaata tänast menüüd",
    "hero.delivery": "Kohaletoimetamine",
    "hero.pickup": "Isetulemine",
    "hero.cateringEyebrow": "CATERING: AFRICAN RESTAURANT ESTONIA",
    "hero.cateringTitle": "Too Lääne-Aafrika maitsed oma sündmusele",
    "hero.cateringDescription": "Alates väikestest koosviibimistest kuni eriliste pidustusteni – pakume autentseid Lääne-Aafrika maitseid, mida teie külalised mäletavad.",
    "hero.exploreCatering": "Tutvu cateringiga",
    "market.comingSoon": "Peagi tulekul",
    "market.eyebrow": "ARE turg",
    "market.title": "Veel veidi Aafrikat teie koju.",
    "market.description": "African Restaurant Estonia valmistab ette turukogemust, kus saab avastada valitud Aafrika tooteid ja restorani lemmikuid.",
    "market.status": "Olek",
    "market.launch": "Turu avamine peagi",
    "market.label": "ARE turg",
    "install.title": "Saa African Restaurant Estonia oma telefoni",
    "install.description": "Paigalda rakendus kiiremaks tellimiseks ja lihtsaks ligipääsuks.",
    "install.install": "Paigalda",
    "install.notNow": "Mitte praegu",
    "install.iosDescription": "Paigaldamiseks puuduta Jaga ja seejärel Lisa avaekraanile.",
    "install.iosAction": "Selge",
    "install.close": "Sulge paigaldamise meeldetuletus",
  },
  fi: {
    ...english,
    "nav.home": "Etusivu",
    "nav.menu": "Menu",
    "nav.about": "Tietoa meistä",
    "nav.catering": "Catering",
    "nav.contact": "Yhteystiedot",
    "nav.market": "Kauppa",
    "nav.startOrder": "Aloita tilaus",
    "nav.login": "Kirjaudu",
    "nav.signIn": "Kirjaudu sisään",
    "nav.account": "Tili",
    "nav.exitGuest": "Poistu vierastilasta",
    "nav.exitGuestSession": "Lopeta vierasistunto",
    "nav.logout": "Kirjaudu ulos",
    "nav.openMenu": "Avaa valikko",
    "nav.closeMenu": "Sulje valikko",
    "nav.language": "Kieli",
    "hero.eyebrow": "Aitoja makuja. Aitoa kulttuuria.",
    "hero.titleLine1": "Länsi-Afrikan",
    "hero.titleLine2": "maku",
    "hero.titleLine3": "juuri täällä.",
    "hero.description": "Aitoa nigerialaista ja länsiafrikkalaista ruokaa Tallinnassa. Tuoreena valmistettua, täynnä rohkeita makuja ja kodin lämpöä.",
    "hero.startOrder": "Aloita tilaus",
    "hero.todayMenu": "Katso päivän menu",
    "hero.delivery": "Kotiinkuljetus",
    "hero.pickup": "Nouto saatavilla",
    "hero.cateringEyebrow": "CATERING: AFRICAN RESTAURANT ESTONIA",
    "hero.cateringTitle": "Tuo Länsi-Afrikan maut tapahtumaasi",
    "hero.cateringDescription": "Pienistä kokoontumisista erityisiin juhliin – tarjoamme aitoja länsiafrikkalaisia makuja, jotka vieraasi muistavat.",
    "hero.exploreCatering": "Tutustu cateringiin",
    "market.comingSoon": "Tulossa pian",
    "market.eyebrow": "ARE-kauppa",
    "market.title": "Hieman lisää Afrikkaa kotiisi.",
    "market.description": "African Restaurant Estonia valmistelee kauppakokemusta, jossa voit löytää valittuja afrikkalaisia tuotteita ja ravintolan suosikkeja.",
    "market.status": "Tila",
    "market.launch": "Kauppa avautuu pian",
    "market.label": "ARE-kauppa",
    "install.title": "Hanki African Restaurant Estonia puhelimeesi",
    "install.description": "Asenna nopeampaa tilaamista ja helppoa käyttöä varten.",
    "install.install": "Asenna",
    "install.notNow": "Ei nyt",
    "install.iosDescription": "Asenna napauttamalla Jaa ja sitten Lisää Koti-valikkoon.",
    "install.iosAction": "Selvä",
    "install.close": "Sulje asennusmuistutus",
  },
  ru: {
    ...english,
    "nav.home": "Главная",
    "nav.menu": "Меню",
    "nav.about": "О нас",
    "nav.catering": "Кейтеринг",
    "nav.contact": "Контакты",
    "nav.market": "Магазин",
    "nav.startOrder": "Начать заказ",
    "nav.login": "Войти",
    "nav.signIn": "Войти",
    "nav.account": "Аккаунт",
    "nav.exitGuest": "Выйти из гостевого режима",
    "nav.exitGuestSession": "Завершить гостевую сессию",
    "nav.logout": "Выйти",
    "nav.openMenu": "Открыть меню",
    "nav.closeMenu": "Закрыть меню",
    "nav.language": "Язык",
    "hero.eyebrow": "Настоящие вкусы. Настоящая культура.",
    "hero.titleLine1": "Вкус Западной",
    "hero.titleLine2": "Африки",
    "hero.titleLine3": "прямо здесь.",
    "hero.description": "Настоящая нигерийская и западноафриканская кухня в Таллинне. Свежие блюда с яркими вкусами и теплом домашней кухни.",
    "hero.startOrder": "Начать заказ",
    "hero.todayMenu": "Смотреть меню дня",
    "hero.delivery": "Доставка",
    "hero.pickup": "Самовывоз",
    "hero.cateringEyebrow": "КЕЙТЕРИНГ AFRICAN RESTAURANT ESTONIA",
    "hero.cateringTitle": "Принесите вкус Западной Африки на своё мероприятие",
    "hero.cateringDescription": "От небольших встреч до особых торжеств — мы подадим настоящие западноафриканские блюда, которые ваши гости запомнят.",
    "hero.exploreCatering": "Узнать о кейтеринге",
    "market.comingSoon": "Скоро",
    "market.eyebrow": "Магазин ARE",
    "market.title": "Ещё немного Африки для вашего дома.",
    "market.description": "African Restaurant Estonia готовит магазин, где можно будет найти избранные африканские продукты и любимые блюда ресторана.",
    "market.status": "Статус",
    "market.launch": "Открытие магазина скоро",
    "market.label": "Магазин ARE",
    "install.title": "Установите African Restaurant Estonia на телефон",
    "install.description": "Установите приложение для быстрых заказов и удобного доступа.",
    "install.install": "Установить",
    "install.notNow": "Не сейчас",
    "install.iosDescription": "Для установки нажмите «Поделиться», затем «На экран Домой».",
    "install.iosAction": "Понятно",
    "install.close": "Закрыть напоминание об установке",
  },
};

export function isSupportedLanguage(value: string | null | undefined): value is Language {
  return Boolean(value && supportedLanguages.includes(value as Language));
}

export function languageFromBrowser(preferences: readonly string[]): Language {
  for (const preference of preferences) {
    const base = preference.toLowerCase().split("-")[0];
    if (isSupportedLanguage(base)) return base;
  }

  return "en";
}

export const languageLabels: Record<Language, string> = {
  en: "EN",
  et: "ET",
  fi: "FI",
  ru: "RU",
};

export type { TranslationKey };
