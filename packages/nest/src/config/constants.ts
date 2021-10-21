export const DEFAULT_DATE_FORMAT = "dd-MM-yyyy 'kl.' HH:mm";

export const ACL_PERMISSION = {
  send: 0b100000,
  access: 0b10000,
  get: 0b01000,
  insert: 0b00100,
  update: 0b00010,
  delete: 0b00001,
  add: 0b00100,
  full: 0b11111,
};

export const USER_GROUP_STATUS = {
  admin: 1,
  staff: 2,
  store: 3,
};

export const USER_GROUP_ADMIN = 1;
export const USER_GROUP_STAFF = 2;
export const USER_GROUP_STORE = 3;
export const DEFAULT_SLUG = '';

export const NUMBER_ROW_PER_PAGE = 20;
export const MAX_RETRY_INSERT = 20;

export const OFFER_TYPE = {
  PRICE: 1,
  LIMIT: 2,
  MEMBER: 3,
  QUANTITY: 4,
  COMBO: 5,
  LIMIT_COMBO: 6,
};

export const ORDER_STATUS = {
  complaint: -1,
  received: 1,
  packed: 2,
  packedPaymentIssue: 20,
  canceled: 99,
};

export const PRODUCT_STATUS = {
  associated: -1,
  inactive: 0,
  active: 1,
  inactiveOffer: 2,
  activeOffer: 3,
};

export const ELASTIC_INDEX = {
  product: 'egebjerg-product',
  customer: 'egebjerg-customer',
};

export const TRANSACTION_TYPE = {
  fee: 1,
  normal: 2,
};
export const MSG_CLAIM_PAYMENT_FAIL = 'Betaling kan ikke hæves på ordre #{order_id} - {customer_name}';
export const MSG_CUSTOMER_CHANGE_CARD = 'Kunde har tilføjet et nyt betalingskort. Ordre #{order_id} - {customer_name} kan nu hæves';
export const MSG_CUSTOMER_CHANGE_PAYMENT_METHOD_TO_PBS = 'Haft spærret betalingskort. Nu på indbetalingskort/betalingsservice. Ordre #{order_id} - {customer_name} kan nu hæves';
export const MSG_CUSTOMER_CHANGE_PAYMENT_METHOD_TO_CARD = 'Fra indbetalingskort/betalingsservice til betalingskort. Ordre #{order_id} - {customer_name} kan nu hæves på betalingskort i stedet for. Husk at trække beløbet ud af vores deb. konto.';
export const MSG_NOTICE_STORE_CHANGE_PBS_TO_CARD_RECIEVED = '#{order_id} - {customer_name} Vær opmærksom på at siden ordren er lavet er betalingsmetoden ændret fra pbs til kort';
export const MSG_NOTICE_STORE_CHANGE_PBS_TO_CARD_PACKED = 'Ordre #{order_id} - {customer_name} - Fra pbs til kort. Denne ordre skal hæves på kort i stedet for. Husk at trække beløbet ud af vores deb. konto';

export const MSG_CARD_INFORM_MISSING = 'Card information is missing. Payment method is changed to Indbetalingskort/Betalingsservice';
export const MSG_CARD_INFORM_MISSING_NOT_ENOUGHT_CREDIT_LIMIT = 'Card information is missing. Credit limit is not enough, you have to increase credit limit';


export const NOTIFICATION_STATUS = {
  new: 0,
  processing: 1,
  solved: 2,
};

export const FREE_NAME_PRODUCT_ID = 33850;
export const NO_STOCK_PRODUCT_ID = 135646;
export const NOT_USED_PRODUCT_ID = 28754;
export const SPECIAL_PRODUCT_ID_LIST = [
  FREE_NAME_PRODUCT_ID,
  NO_STOCK_PRODUCT_ID,
  NOT_USED_PRODUCT_ID
];

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

export const MAIL_ID = {
  unsubcribe: 1,
  orderIsCreated: 2,
}