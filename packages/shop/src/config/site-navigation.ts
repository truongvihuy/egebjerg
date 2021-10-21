import DAFlag from '../assets/images/country/DAFlag.png';
import USFlag from '../assets/images/country/USFlag.png';

export const HOME_PAGE = '/';
export const GROCERY_PAGE = '/grocery';
export const GROCERY_PAGE_TWO = '/grocery-two';
export const BAKERY_PAGE = '/bakery';
export const MAKEUP_PAGE = '/makeup';
export const CLOTHING_PAGE = '/clothing';
export const BAGS_PAGE = '/bags';
export const BOOK_PAGE = '/book';
export const FURNITURE_PAGE = '/furniture';
// export const FURNITURE_PAGE_TWO = '/furniture-two';
export const MEDICINE_PAGE = '/medicine';
// export const RESTAURANT_PAGE = '/restaurant';
export const REQUEST_MEDICINE_PAGE = '/request-medicine';
export const CHECKOUT_PAGE = '/checkout';
export const CHECKOUT_PAGE_TWO = '/checkout-alternative';
export const PROFILE_PAGE = '/profile';
export const MOST_BOUGHT_PAGE = '/most-bought';
export const YOUR_ORDER_PAGE = '/order';
export const YOUR_ORDER_WITH_SLUG_PAGE = '/order/[slug]';
export const ORDER_RECEIVED_PAGE = '/order-received';
export const OFFER_PAGE = '/offer';
export const NEWSPAPER_PAGE = '/newspaper';
export const FAVORITE_PAGE = '/favorite';
export const HELP_PAGE = '/help';
export const CONTACT_PAGE = '/contact';
export const TERMS_AND_SERVICES_PAGE = '/terms';
export const PRIVACY_POLICY_PAGE = '/privacy';
export const CUSTOMER_LIST_PAGE = '/customer-list';
export const MUST_LOGIN_PAGE_LIST = [
  PROFILE_PAGE, CHECKOUT_PAGE, FAVORITE_PAGE, MOST_BOUGHT_PAGE, 
  YOUR_ORDER_PAGE, YOUR_ORDER_WITH_SLUG_PAGE, CUSTOMER_LIST_PAGE
];
// Mobile Drawer Menus

export const HOME_MENU_ITEM = {
  id: 'nav.home',
  defaultMessage: 'Home',
  href: HOME_PAGE,
};

export const HELP_MENU_ITEM = {
  id: 'nav.help',
  defaultMessage: 'Help',
  href: HELP_PAGE,
};
export const OFFER_MENU_ITEM = {
  id: 'nav.offer',
  defaultMessage: 'Offer',
  href: OFFER_PAGE,
};
export const TERMS_MENU_ITEM = {
  id: 'termsOfTrade',
  defaultMessage: 'Terms of trade',
  href: TERMS_AND_SERVICES_PAGE,
};
export const NEWSPAPER_MENU_ITEM = {
  id: 'nav.newspaper',
  defaultMessage: 'Newspaper',
  href: NEWSPAPER_PAGE,
};
export const FAVORITE_MENU_ITEM = {
  id: 'nav.favorite',
  defaultMessage: 'Favorite',
  href: FAVORITE_PAGE,
};
export const MOST_BOUGHT_MENU_ITEM = {
  id: 'nav.mostBought',
  defaultMessage: 'Most bought',
  href: MOST_BOUGHT_PAGE,
};
export const ORDER_MENU_ITEM = {
  id: 'nav.order',
  href: YOUR_ORDER_PAGE,
  defaultMessage: 'Order',
};
export const REQUEST_MEDICINE_MENU_ITEM = {
  id: 'nav.request_medicine',
  defaultMessage: 'Request Medicine',
  href: REQUEST_MEDICINE_PAGE,
};
export const CONTACT_MENU_ITEM = {
  id: 'nav.contact',
  defaultMessage: 'Contact',
  href: CONTACT_PAGE,
};
export const PROFILE_MENU_ITEM = {
  id: 'nav.profile',
  defaultMessage: 'Profile',
  href: PROFILE_PAGE,
};

export const CUSTOMER_LIST_MENU_ITEM = {
  id: 'customerListTitle',
  defaultMessage: 'Customer list',
  href: CUSTOMER_LIST_PAGE,
};
export const AUTHORIZED_MENU_ITEMS = [
  PROFILE_MENU_ITEM,
  {
    id: 'nav.checkout',
    defaultMessage: 'Checkout',
    href: CHECKOUT_PAGE,
  },
  ORDER_MENU_ITEM,
  FAVORITE_MENU_ITEM,
  MOST_BOUGHT_MENU_ITEM
];
// category menu items for header navigation
export const TEMPLATE_TYPE = [
  {
    id: 'nav.grocery',
    href: GROCERY_PAGE,
    defaultMessage: 'Grocery',
    icon: 'FruitsVegetable',
    dynamic: true,
  },
  {
    id: 'nav.grocery-two',
    href: GROCERY_PAGE_TWO,
    defaultMessage: 'Grocery Two',
    icon: 'FruitsVegetable',
    dynamic: false,
  },
  {
    id: 'nav.bakery',
    href: BAKERY_PAGE,
    defaultMessage: 'Bakery',
    icon: 'Bakery',
    dynamic: false,
  },
  {
    id: 'nav.makeup',
    defaultMessage: 'Makeup',
    href: MAKEUP_PAGE,
    icon: 'FacialCare',
    dynamic: true,
  },
  {
    id: 'nav.bags',
    defaultMessage: 'Bags',
    href: BAGS_PAGE,
    icon: 'Handbag',
    dynamic: true,
  },
  {
    id: 'nav.clothing',
    defaultMessage: 'Clothing',
    href: CLOTHING_PAGE,
    icon: 'DressIcon',
    dynamic: true,
  },
  {
    id: 'nav.furniture',
    defaultMessage: 'Furniture',
    href: FURNITURE_PAGE,
    icon: 'FurnitureIcon',
    dynamic: true,
  },
  // {
  //   id: 'nav.furniture-two',
  //   defaultMessage: 'Furniture Two',
  //   href: FURNITURE_PAGE_TWO,
  //   icon: 'FurnitureIcon',
  //   dynamic: false,
  // },
  {
    id: 'nav.book',
    defaultMessage: 'Book',
    href: BOOK_PAGE,
    icon: 'BookIcon',
    dynamic: true,
  },
  {
    id: 'nav.medicine',
    defaultMessage: 'Medicine',
    href: MEDICINE_PAGE,
    icon: 'MedicineIcon',
    dynamic: true,
  },
  // {
  //   id: 'nav.foods',
  //   defaultMessage: 'Foods',
  //   href: RESTAURANT_PAGE,
  //   icon: 'Restaurant',
  // },
];

export const MOBILE_DRAWER_MENU = [
  TERMS_MENU_ITEM,
  HELP_MENU_ITEM,
  CONTACT_MENU_ITEM,
];

export const PROFILE_SIDEBAR_TOP_MENU = [ORDER_MENU_ITEM, HELP_MENU_ITEM];
export const PROFILE_SIDEBAR_BOTTOM_MENU = [PROFILE_MENU_ITEM];

export const LANGUAGE_MENU = [
  // {
  //   id: 'ar',
  //   defaultMessage: 'Arabic',
  //   icon: 'SAFlag',
  // },
  // {
  //   id: 'zh',
  //   defaultMessage: 'Chinese',
  //   icon: 'CNFlag',
  // },
  {
    id: 'da-DK',
    defaultMessage: 'Danish',
    icon: DAFlag,
  },
  {
    id: 'en',
    defaultMessage: 'English',
    icon: USFlag,
  },
  // {
  //   id: 'de',
  //   defaultMessage: 'German',
  //   icon: 'DEFlag',
  // },
  // {
  //   id: 'he',
  //   defaultMessage: 'Hebrew',
  //   icon: 'ILFlag',
  // },
  // {
  //   id: 'es',
  //   defaultMessage: 'Spanish',
  //   icon: 'ESFlag',
  // },
];
