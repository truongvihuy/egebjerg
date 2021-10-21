import { ToastPosition } from 'react-hot-toast';
export const siteConstant = {};

export const CURRENCY = 'DKK';
export const PER_KG = 'pr.kg';
export const WEIGHT = 'g';

export const OFFER_TYPE = {
    PRICE: 1,
    LIMIT: 2,
    MEMBER: 3,
    QUANTITY: 4,
    COMBO: 5,
    LIMIT_COMBO: 6,
}

export const OFFER_TYPE_CONFIG = {
    1: {
        name: 'PRICE',
        displayType: false,
        color: '#eda32f',
        modalTitle: 'Almindeligt Tilbud' //General Offer
    },
    2: {
        name: 'MAKS KØB',
        displayType: true,
        color: '#eda32f',
        modalTitle: 'Tilbud med mængdebegrænsning' //Offer with quantity limitation
    },
    3: {
        name: 'MEDLEM',
        displayType: true,
        color: '#c31414',
        modalTitle: 'Medlemstilbud' //Membership offer
    },
    4: {
        name: 'FLERSTYK',
        displayType: true,
        color: '#2196F3',
    },
    5: {
        name: 'MIX',
        displayType: true,
        color: '#28a745',
    },
    6: {
        name: 'MAKS KØB MIX',
        displayType: true,
        color: '#eda32f',
    },
}
export const PAYMENT_METHOD_PBS = 'PBS';
export const PAYMENT_METHOD_CARD = 'Card';
export const PAYMENT_METHOD_NO_PAYMENT = 'No Payment';

export const REPLACEMENT_GOODS_EXPLAINATION = 'Her kan du vælge om du ønsker erstatningsvarer ved eventuelt udsolgte varer. Brugsen vil gøre deres bedste for at finde en tilsvarende vare til samme pris eller billigere, men dette kan ikke altid garanteres.';

interface ToasterProps {
    position: ToastPosition,
    reverseOrder?: boolean;
    containerStyle?: any;
    toastOptions: any,
}

export const CONFIG_TOASTER: ToasterProps = {
    position: 'top-center',
    toastOptions: {
        // className: '',
        style: {
            margin: '20px',
            background: '#363636',
            color: '#fff',
            zIndex: 1,
        },
        // Default options for specific types
        success: {
            duration: 6000,
        }
    }
}

export const NETWORK_ERROR_MSG = 'ERROR! Prøv igen';
export const GRAPHQL_ERROR_MSG = 'ERROR! Kontakt administratoren';
export const LOGIN_ERROR_MSG = 'Log ind svigte! Kontakt administratoren';
export const APOLLO_CODE_SKIP_LIST = ['UNAUTHENTICATED', 'UPDATE_PASSWORD_FAILED', 'INVALID/EXPIRED_REFRESH_TOKEN'];
export const DELAY_TIME_REQUEST_SEARCH = 500;

export const CUSTOMER_TYPE = {
    admin: 2,
    normal: 1
}