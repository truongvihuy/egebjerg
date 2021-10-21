import dynamic from 'next/dynamic';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from 'config/site-theme/default';
import { AppProvider } from 'contexts/app/app.provider';
import { FirebaseProvider } from 'contexts/firebase/firebase.provider';
import { CustomerProvider } from 'contexts/customer/customer.provider';
import { LanguageProvider } from 'contexts/language/language.provider';
import { CartProvider } from 'contexts/cart/use-cart';
import { useApollo } from 'utils/apollo';
import { useMedia } from 'utils/use-media';
import NProgress from 'nprogress';
import Router from 'next/router';
import { CONFIG_TOASTER } from 'config/constant';

// External CSS import here
import 'rc-drawer/assets/index.css';
import 'rc-table/assets/index.css';
import 'rc-collapse/assets/index.css';
import 'react-multi-carousel/lib/styles.css';
import 'components/multi-carousel/multi-carousel.style.css';
import 'react-spring-modal/dist/index.css';
import 'overlayscrollbars/css/OverlayScrollbars.css';
import 'components/scrollbar/scrollbar.css';
import '@redq/reuse-modal/lib/index.css';
import 'swiper/swiper-bundle.min.css';
import { GlobalStyle } from 'assets/styles/global.style';
import 'nprogress/nprogress.css';

// Language translation messages
import { messages } from 'config/site-translation/messages';
import 'typeface-lato';
import 'typeface-poppins';

const Toaster = dynamic(() => import('react-hot-toast').then((mod) => mod.Toaster), {
  ssr: false,
});

const Reactotron = dynamic(() => import('config/reactotron'), {
  ssr: false,
});

const AppLayout = dynamic(() => import('layouts/app-layout'));

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function ExtendedApp({ Component, pageProps }) {
  const mobile = useMedia('(max-width: 580px)');
  const tablet = useMedia('(max-width: 991px)');
  const desktop = useMedia('(min-width: 992px)');
  const apolloClient = useApollo(pageProps.initialApolloState);

  return (
    <>
      <Reactotron />
      <ThemeProvider theme={defaultTheme}>
        <GlobalStyle />
        <LanguageProvider messages={messages}>
          <FirebaseProvider>
            <CustomerProvider>
              <ApolloProvider client={apolloClient}>
                <CartProvider>
                  <AppProvider>
                    <Toaster position={CONFIG_TOASTER.position}
                      reverseOrder={CONFIG_TOASTER.reverseOrder} containerStyle={CONFIG_TOASTER.containerStyle}
                      toastOptions={CONFIG_TOASTER.toastOptions} />
                    <AppLayout deviceType={{ mobile, tablet, desktop }}>
                      <Component
                        {...pageProps}
                        deviceType={{ mobile, tablet, desktop }}
                      />
                    </AppLayout>
                  </AppProvider>
                </CartProvider>
              </ApolloProvider>
            </CustomerProvider>
          </FirebaseProvider>
        </LanguageProvider>
      </ThemeProvider>
    </>
  );
}
