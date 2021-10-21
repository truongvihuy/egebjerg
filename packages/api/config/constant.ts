export const YOU_MUST_BE_LOGGED_IN = 'Du skal være logget ind';
export const FIELD_CANNOT_BE_UPDATED = 'Felt {field} kan ikke opdateres';
export const PASSWORD_IS_WRONG = 'Adgangskoden er forkert';
export const MSG_PRODUCT_CANNOT_ORDER = 'Dette produkt \'{name}\' kan i øjeblikket ikke bestilles';
export const MSG_ITEM_NOT_FOUND = 'Find ikke fundet _id {_id}';
export const MSG_RETRY_INSERT = 'Optaget system. Prøv igen';
export const MSG_CAN_NOT_SEND_EMAIL = 'Kan ikke sende Email';
export const MSG_SYSTEM_ERROR = 'Optaget system. Kontakt administratoren';
export const MSG_ORDER_HAVE_PRICE_CHANGES = 'Ordren har en prisjustering. Tjek venligst din ordre. Hvis du accepterer denne nye pris, skal du placere din ordre igen.';
export const MAIL_ID = {
    unsubcribe: 1,
    order_is_created:2
};

export const PRODUCT_STATUS = {
    INACTIVE: 0,
    ACTIVE: 1,
};
export const MAX_RETRY_INSERT = 5;

export const SORT_CONDITION_MAP: any = {
    'newest': {
        _id: -1
    },
    'best-seller': {
        total_bought: -1
    },
    'low-price': {
        salePrice: 1
    },
    'high-price': {
        salePrice: -1
    },
    'standard': {
        order: -1
    },
};

export const processUnsubcribleMailPattern = (homeHelperName: string, customer: any, date: string) => {
    return `<b>${homeHelperName}</b> bekræfter hermed, at brugeren
<br/><br/>
&nbsp;&nbsp;&nbsp;&nbsp;<b>${customer.name}</b><br/>
&nbsp;&nbsp;&nbsp;&nbsp;${customer.address_info.address}<br/>
&nbsp;&nbsp;&nbsp;&nbsp;${customer.address_info.zip_code} ${customer.address_info.city}<br/><br/>
    
&nbsp;&nbsp;&nbsp;&nbsp;ikke vil foretage noget køb i denne uge.<br/><br/>

Brugeren er tilknyttet <b>${customer.store.name}</b><br/><br/>
    
Fravalgt ${date}`
};

export const DEFAULT_CONDITION_PRODUCT = {
    just_backend: false
};