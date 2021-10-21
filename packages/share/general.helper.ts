import { FREE_NAME_PRODUCT_ID, CURRENCY, LOCALE } from './constant';

export const isFreeNameProduct = (id: number) => id === FREE_NAME_PRODUCT_ID;

export const formatCurrency = (number: number, displayCurrency = true) => {
    let intlCurrency = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2, style: 'currency', currency: CURRENCY, currencyDisplay: 'code' });
    //Must use NumberFormat to get char `,` but cannot move DKK to left side so must remove it
    return `${displayCurrency ? CURRENCY + ' ' : ''}${intlCurrency.format(number).replace(/[a-z]{3}/i, "").trim()}`;
}
