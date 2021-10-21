export const OFFER_TYPE = {
  PRICE: 1,
  LIMIT: 2,
  MEMBER: 3,
  QUANTITY: 4,
  COMBO: 5,
  LIMIT_COMBO: 6,
};
export const CURRENCY = 'DKK';
export const LOCALE = 'da-Dk'
export const DEFAULT_SORT = 'standard';
export const DEFAULT_DATE_FORMAT = 'dd-MM-yyyy \'kl.\' HH:mm';

export const WRONG_ACCOUNT_LOGIN_MSG = 'Forkerte kontooplysninger, prøv igen';

export const CUSTOMER_TYPE = {
  NORMAL: 1,
  GROUP_ADMIN: 2,
};

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
    color: '#09d261',
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

export const FREE_NAME_PRODUCT_ID = 33850;
export const NO_STOCK_PRODUCT_ID = 135646;
export const NOT_USED_PRODUCT_ID = 28754;

export const SPECIAL_PRODUCT_ID_LIST = [NOT_USED_PRODUCT_ID, NO_STOCK_PRODUCT_ID, FREE_NAME_PRODUCT_ID];