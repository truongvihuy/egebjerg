import config from 'config/config';
import { EditorTools } from '@progress/kendo-react-editor';

// prettier-ignore
const {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  CleanFormatting, Indent, Outdent, OrderedList, UnorderedList, FontSize, FormatBlock,
} = EditorTools;
export const TOOL_EDITOR = [
  [Bold, Italic, Underline, Strikethrough],
  CleanFormatting,
  [AlignLeft, AlignCenter, AlignRight, AlignJustify],
  [Indent, Outdent],
  [OrderedList, UnorderedList],
  FontSize,
  FormatBlock,
];
export const DEFAULT_FONT = 'ubuntu';
export const AUTH_PERMISSION = {
  access: 0b10000,
  get: 0b01000,
  insert: 0b00100,
  update: 0b00010,
  delete: 0b00001,
};

export const getPagePermission = (pageName, userInfo) => {
  let pagePermission = {};
  if (userInfo) {
    for (const [k, v] of Object.entries(AUTH_PERMISSION)) {
      pagePermission[k] = (userInfo.permission[pageName] & v) === v;
    }
  }

  return pagePermission;
};

export const SHOP_URL = config.SHOP_URL;

export const getImageSrc = (imgSrc, size = 300, ignoreCache = false) => {
  if (!imgSrc) {
    return null;
  }
  const isSVG = imgSrc.indexOf('.svg') > -1;
  const isThumbor = !imgSrc.startsWith('http') && imgSrc.match(/^[a-fA-F0-9]{32}\/*/);
  let time = ignoreCache ? `?t=${Date.now()}` : '';
  if (isThumbor) {
    if (isSVG) {
      return `${config.THUMBOR_SERVER_URL}/image/${imgSrc}${time}`;
    } else {
      return `${config.THUMBOR_SERVER_URL}/images/${size}x0/${imgSrc}${time}`;
    }
  } else {
    return imgSrc;
  }
};

export const USER_GROUP_ADMIN = 1;
export const USER_GROUP_STAFF = 2;
export const USER_GROUP_STORE = 3;

export const NUMBER_ROW_PER_PAGE = 20;
export const PAGING_CONFIG = {
  buttonCount: 5,
  pageSizes: [20, 40, 60, 80, 100],
};
export const SEARCH_DELAY_TIME = 400;
export const ORDER_STATUS = {
  received: 1,
  packed: 2,
  packedPaymentIssue: 20,
  canceled: 99,
};
export const ORDER_STATUS_CONFIG = {
  1: {
    value: 1,
    name: 'Afventer', // Received
    color: '#ff6f00',
  },
  2: {
    value: 2,
    name: 'Pakket', // Packed
    color: '#069f49',
  },
  20: {
    value: 20,
    name: 'Pakket - Betalingsproblem', // Packed - Payment Issue
    color: '#c31414',
  },
  99: {
    value: 99,
    name: 'Annulleret', // Canceled
    color: '#525e8a',
  },
};

export const LOCALE = 'da-Dk';
export const CURRENCY = 'DKK';
export const WEIGHT = 'g';
export const DEFAULT_DATE_FORMAT = 'dd/MM/yyyy HH:mm';

export const MSG_ENTER_YOUR_USER_NAME = 'Indtast dit brugernavn';

export const MSG_ENTER_YOUR_USERNAME = 'Indtast dit brugernavn';
export const MSG_ENTER_YOUR_PASSWORD = 'Indtast venligst dit kodeord';
export const MSG_PASSWORD_TOO_SHORT = 'Adgangskoden er for kort';
export const MSG_WRONG_USERNAME_PASSWORD = 'Forkert brugernavn or adgangskode';
export const MSG_USER_DATA_SAVED_WITH_API = 'Brugerdata gemt med API';
export const MSG_AUTO_LOGIN_FAIL = 'Log ind igen';
export const PLACE_HOLDER_ENTER_USER_GROUP_NAME = 'Indtast bruger navn';
export const MSG_ENTER_USER_GROUP_NAME = 'Indtast bruger navn';
export const MSG_CONFIRM_CREATE_USER_GROUP = 'Er du sikker på at oprette brugergruppe?';
export const MSG_CONFIRM_DELETE_USER_GROUP = 'Slet denne gruppe permanent?';
export const MSG_NO_DATA = 'Der er ingen tilgængelige data';
export const MSG_REQUIRED = 'Krævet';
export const MSG_UNMATCH_MAIL_PATTERN = 'Indtast venligst e-mail';
export const MSG_DO_NOT_HAVE_SAVED_CARD = 'Betalingskortoplysninger mangler';
export const MSG_MIN = 'Skal være større end eller lig med';
export const MSG_MAX = 'skal være mindre end eller lig med';
export const MSG_CAN_NOT_CHANGE_PAYMENT_METHOD = 'Kan ikke ændre betalingsmetode ordre pakket';
export const MSG_WARNING_CHANGE_PAYMENT_METHOD = 'Ordrestatus ændres til "Pakket", efter at du har ændret betalingsmetoden';
export const MSG_CARD_INFORM_MISSING = 'Card information is missing. Payment method is changed to Indbetalingskort/Betalingsservice';
export const MSG_CARD_INFORM_MISSING_NOT_ENOUGHT_CREDIT_LIMIT = 'Card information is missing. Credit limit is not enough, you have to increase credit limit';
export const PLACEHOLDER_CUSTOMER = '#ID | @Brugernavn | Navn | Adresse | Telefon';
export const PLACEHOLDER_PRODUCT = '#ID | !Varenr | Navn';

export const WARNING_CREDIT_LIMIT = 500;

export const OFFER_TYPE = {
  PRICE: 1,
  LIMIT: 2,
  MEMBER: 3,
  QUANTITY: 4,
  COMBO: 5,
  LIMIT_COMBO: 6,
};

export const OFFER_TYPE_CONFIG = {
  1: {
    value: 1,
    name: 'PRIS',
    displayType: false,
    color: '#eda32f',
    modalTitle: 'Almindeligt Tilbud', //General Offer
    disabled: 'quantity',
  },
  2: {
    value: 2,
    name: 'MAKS KØB',
    displayType: true,
    color: '#eda32f',
    modalTitle: 'Tilbud med mængdebegrænsning', //Offer with quantity limitation
  },
  3: {
    value: 3,
    name: 'MEDLEM',
    displayType: true,
    color: '#c31414',
    modalTitle: 'Medlemstilbud', //Membership offer
    disabled: 'quantity',
  },
  4: {
    value: 4,
    name: 'FLERSTYK',
    displayType: true,
    color: '#2196F3',
  },
  5: {
    value: 5,
    name: 'MIX',
    displayType: true,
    color: '#28a745',
  },
  6: {
    value: 6,
    name: 'MAKS KØB MIX',
    displayType: true,
    color: '#eda32f',
  },
};

export const PAYMENT_METHOD = {
  'No Payment': {
    value: 'No Payment',
    label: 'Intet at betale',
    shortLabel: 'Intet at betale',
  },
  PBS: {
    value: 'PBS',
    label: 'Indbetalingskort / Betalingsservice',
    shortLabel: 'PBS',
  },
  Card: {
    value: 'Card',
    label: 'Kort',
    shortLabel: 'Kort',
  },
};
export const DATETIME_PICKER_DEFAULT_PLACEHODLER = { day: 'dd', month: 'mm', year: 'yyyy' };
export const PAYMENT_METHOD_NO_PAYMENT = 'No Payment';
export const CATEGORY_ID_BAKE = 1507;
export const CATEGORY_ID_FROZEN = 1270;

export const FREE_NAME_PRODUCT_ID = 33850;
export const NO_STOCK_PRODUCT_ID = 135646;
export const NOT_USED_PRODUCT_ID = 28754;
export const BUTTON_ADD_PRODUCT = [
  {
    product_id: NOT_USED_PRODUCT_ID,
    label: 'Ikke brugt varenr.',
  },
  {
    product_id: NO_STOCK_PRODUCT_ID,
    label: 'Ingen varer',
  },
  {
    product_id: FREE_NAME_PRODUCT_ID,
    label: 'Fritekst',
  },
];

export const TASK_STATUS = {
  disable: -1,
  idle: 0,
  pending: 1,
  running: 2,
}

export const PRODUCT_STATUS = {
  associated: -1,
  inactive: 0,
  active: 1,
  inactiveOffer: 2,
  activeOffer: 3,
}

export const TASK_STATUS_CONFIG = {
  '-1': {
    value: -1,
    name: 'Disable',
    color: '#C0C0C0.',
  },
  0: {
    value: 0,
    name: 'Idle', // Received
    color: '#09d261',
  },
  1: {
    value: 1,
    name: 'Pending', // Received
    color: '#2196F3',
  },
  2: {
    value: 2,
    name: 'Running', // Packed
    color: '#ffa500',
  }
}
export const SPECIAL_PRODUCT_ID_LIST = [NOT_USED_PRODUCT_ID, NO_STOCK_PRODUCT_ID, FREE_NAME_PRODUCT_ID];

export const CUSTOMER_TYPE_MAP = {
  normal: 1,
  admin: 2,
};

export const LIMIT_EXP_THUMBOR = 60;

export const PRODUCT_ORDER_ROW_COLOR = {
  search: '#CEE5D0',
  update: '#e3f2fd',
}
export const NOTIFICATION_STATUS = {
  new: 0,
  processing: 1,
  solved: 2
};
export const TRANSACTION_TYPE = {
  fee: 1,
  normal: 2
}
export const COLOR = {
  warning: '#f44336'
};