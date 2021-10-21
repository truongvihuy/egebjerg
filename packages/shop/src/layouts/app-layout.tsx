import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Sticky from 'react-stickynode';
import Header from './header/header';
import { LayoutWrapper, StyledTransparentOverlay } from './layout.style';
import { preventAllEvent } from 'utils/eventHelper';
import { MUST_LOGIN_PAGE_LIST } from 'config/site-navigation';
import { GET_NEWSPAPER } from 'graphql/query/newspaper';
import { useQuery } from '@apollo/client';

const MobileHeader = dynamic(() => import('./header/mobile-header'), {
  ssr: false,
});

type LayoutProps = {
  className?: string;
  deviceType?: { mobile: boolean, tablet: boolean, desktop: boolean }
  // token?: string;
};

const Layout: React.FunctionComponent<LayoutProps> = ({
  className = '',
  children,
  deviceType: { mobile, tablet, desktop },
  // token,
}) => {
  console.info('render', 'Layout')
  const { pathname, push: routerPush } = useRouter();
  let newspaperList = useQuery(GET_NEWSPAPER);

  let isHomePage = pathname === '/';

  if (typeof window != 'undefined') {
    let isLogedIn = localStorage.getItem('isLogedIn');
    if (MUST_LOGIN_PAGE_LIST.includes(pathname)) {
      if (
        !isLogedIn
        || (isLogedIn === 'normal' && pathname === '/customer-list')
      ) {
        // routerPush('/');
      } else if (isLogedIn === 'group' && pathname !== '/customer-list') {
        routerPush('/customer-list');
      }
    }
  }

  return (
    <>
      <StyledTransparentOverlay id='transparent-overlay' onClick={preventAllEvent} />
      <LayoutWrapper className={`layoutWrapper ${className}`}>
        <Sticky enabled={true} innerZ={1001}>
          {desktop ? (
            <Header className={`sticky ${isHomePage ? 'home' : ''}`} newspaperList={newspaperList?.data?.newspapers ?? []} />
          ) : (
            <MobileHeader className={`sticky ${isHomePage ? 'home' : ''} desktop`} newspaperList={newspaperList?.data?.newspapers ?? []} />
          )}
        </Sticky>
        {children}
      </LayoutWrapper>
    </>
  );
};

export default Layout;
