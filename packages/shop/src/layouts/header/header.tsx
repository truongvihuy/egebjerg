import React from 'react';
import { useRouter } from 'next/router';
import { RightMenu } from './menu/right-menu/right-menu';
import { LeftMenu } from './menu/left-menu/left-menu';
import HeaderWrapper from './header.style';
import LogoImage from 'assets/images/logo.svg';
import Search from 'features/search/search';
import { parseUrlParams } from 'utils/parse-url-params';

type Props = {
  className?: string;
  newspaperList?: any[];
};

const Header: React.FC<Props> = ({ className, newspaperList }) => {
  console.info('render', 'Header');

  return (
    <HeaderWrapper className={className} id="layout-header">
      <LeftMenu logo={LogoImage} />
      <Search isGlobal minimal={true} includeSuggestion className="headerSearch" searchInputId='header-search' />
      <RightMenu newspaperList={newspaperList} />
    </HeaderWrapper>
  );
};

export default Header;