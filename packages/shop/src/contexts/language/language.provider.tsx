import React from 'react';

import { IntlProvider } from 'react-intl';
import { InjectRTL } from 'assets/styles/global.style';
import Cookie from 'js-cookie';
import { defaultLocale } from './language.config';
import { isRTL, isLocale } from './language.utils';
import { StyleSheetManager } from 'styled-components';
import RTLPlugin from 'stylis-plugin-rtl';

const LanguageContext = React.createContext({} as any);

export const LanguageProvider = ({ children, messages }) => {
  const locale = defaultLocale;
  let isRtl = isRTL(locale);

  return (
    <LanguageContext.Provider value={{ locale, isRtl }}>
      <IntlProvider locale={locale} messages={messages[locale]}>
        <InjectRTL lang={locale} dir={isRtl ? 'rtl' : 'ltr'}>
          <StyleSheetManager stylisPlugins={isRtl ? [RTLPlugin] : []}>
            {children}
          </StyleSheetManager>
        </InjectRTL>
      </IntlProvider>
    </LanguageContext.Provider>
  );
};

export const useLocale = () => React.useContext(LanguageContext);
