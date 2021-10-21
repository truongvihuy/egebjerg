import React, { useContext } from 'react';
import Router from 'next/router';
import { CustomerContext } from 'contexts/customer/customer.context';
import {
  SidebarWrapper,
  SidebarTop,
  SidebarBottom,
  SidebarMenu,
} from './sidebar.style';
import { FormattedMessage } from 'react-intl';
import {
  PROFILE_SIDEBAR_TOP_MENU,
  PROFILE_SIDEBAR_BOTTOM_MENU,
} from 'config/site-navigation';

import { initializeApollo } from "utils/apollo";
const SidebarCategory: React.FC<{}> = () => {
  const { customerDispatch } = useContext<any>(CustomerContext);

  return (
    <>
      <SidebarWrapper>
        <SidebarTop>
          {PROFILE_SIDEBAR_TOP_MENU.map((item, index) => (
            <SidebarMenu href={item.href} key={index} intlId={item.id} />
          ))}
        </SidebarTop>

        <SidebarBottom>
          {PROFILE_SIDEBAR_BOTTOM_MENU.map((item, index) => (
            <SidebarMenu href={item.href} key={index} intlId={item.id} />
          ))}
        </SidebarBottom>
      </SidebarWrapper>
    </>
  );
};

export default SidebarCategory;