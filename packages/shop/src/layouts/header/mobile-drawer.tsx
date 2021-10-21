import React, { useContext } from 'react';
import { openModal } from '@redq/reuse-modal';
import { FormattedMessage } from 'react-intl';
import { Scrollbar } from 'components/scrollbar/scrollbar';
import Drawer from 'components/drawer/drawer';
import { Button } from 'components/button/button';
import NavLink from 'components/nav-link/nav-link';
import { CloseIcon } from 'assets/icons/CloseIcon';
import { CustomerContext } from 'contexts/customer/customer.context';
import { customerReducer } from 'contexts/customer/customer.reducer';

import AuthenticationForm from 'features/authentication-form';
import {
  DrawerBody,
  HamburgerIcon,
  DrawerContentWrapper,
  DrawerClose,
  DrawerProfile,
  LogoutView,
  LoginView,
  UserAvatar,
  UserDetails,
  DrawerMenu,
  DrawerMenuItem,
  UserOptionMenu,
} from './header.style';
import {
  MOBILE_DRAWER_MENU,
  PROFILE_PAGE,
  NEWSPAPER_PAGE,
  AUTHORIZED_MENU_ITEMS,
  NEWSPAPER_MENU_ITEM,
  CUSTOMER_LIST_MENU_ITEM
} from 'config/site-navigation';
import { useApp } from 'contexts/app/app.provider';
import NameThumbnail from 'components/name-thumbnail/name-thumbnail';
import NavLinkSubItem from './menu/nav-link-sub-item';

type MobileDrawerProps = {
  newspaperList?: any[];
};

const MobileDrawer: React.FC<MobileDrawerProps> = ({ newspaperList }) => {
  const {
    handleLogout,
    handleChildAccount,
    handleParentAccount,
  } = customerReducer();

  const {
    appState: { isDrawerOpen },
    appDispatch,
  } = useApp();

  const {
    customerState,
    customerDispatch,
  } = useContext<any>(CustomerContext);
  // Toggle drawer
  const toggleHandler = React.useCallback(() => {
    appDispatch({
      type: 'TOGGLE_DRAWER',
    });
  }, [appDispatch]);

  const signInOutForm = () => {
    appDispatch({
      type: 'TOGGLE_DRAWER',
    });

    customerDispatch({
      type: 'SIGNIN',
    });

    openModal({
      show: true,
      overlayClassName: 'quick-view-overlay',
      closeOnClickOutside: true,
      component: AuthenticationForm,
      closeComponent: '',
      config: {
        enableResizing: false,
        disableDragging: true,
        className: 'quick-view-modal',
        width: 458,
        height: 'auto',
      },
    });
  };

  return (
    <Drawer
      width='316px'
      drawerHandler={
        <HamburgerIcon>
          <span />
          <span />
          <span />
        </HamburgerIcon>
      }
      open={isDrawerOpen}
      toggleHandler={toggleHandler}
      closeButton={
        <DrawerClose>
          <CloseIcon />
        </DrawerClose>
      }
    >
      <DrawerBody>
        <Scrollbar className='drawer-scrollbar'>
          <DrawerContentWrapper>
            <DrawerProfile>
              {customerState._id ? (
                <LoginView>
                  <UserAvatar>
                    <NameThumbnail name={customerState.name} />
                  </UserAvatar>
                  <UserDetails>
                    <h3>{customerState.name}</h3>
                    {customerState.phone?.map((phone, index) => <span key={index}>{phone}</span>)}
                  </UserDetails>
                </LoginView>
              ) : (
                <LogoutView>
                  <Button variant='primary' onClick={signInOutForm}>
                    <FormattedMessage
                      id='joinButton'
                      defaultMessage='join'
                    />
                  </Button>
                </LogoutView>
              )}
            </DrawerProfile>

            <DrawerMenu>
              <DrawerMenuItem>
                <NavLinkSubItem
                  onClick={toggleHandler}
                  className='drawer_menu_item'
                  classNameSubItem='drawer_menu_sub_item'
                  item={{
                    ...NEWSPAPER_MENU_ITEM,
                    data: newspaperList.map(newspaper => ({
                      href: NEWSPAPER_MENU_ITEM.href + '?_id=' + newspaper._id + '&page=1',
                      label: newspaper.name,
                    }))
                  }} />
              </DrawerMenuItem>
            </DrawerMenu>
            <DrawerMenu style={{ borderTop: '1px solid #E6E6E6' }}>
              {customerState._id && customerState.isNormalAuthenticated && AUTHORIZED_MENU_ITEMS.map((item) => (
                <DrawerMenuItem key={item.id}>
                  <NavLink
                    onClick={toggleHandler}
                    href={item.href}
                    label={item.defaultMessage}
                    intlId={item.id}
                    className='drawer_menu_item'
                  />
                </DrawerMenuItem>
              ))}
              {customerState._id && customerState.isGroupAuthenticated && (
                <>
                  <DrawerMenuItem>
                    <NavLink
                      onClick={() => {
                        toggleHandler();
                        handleParentAccount();
                      }}
                      href={CUSTOMER_LIST_MENU_ITEM.href}
                      label={CUSTOMER_LIST_MENU_ITEM.defaultMessage}
                      intlId={CUSTOMER_LIST_MENU_ITEM.id}
                      className='drawer_menu_item'
                    />
                  </DrawerMenuItem>
                  {customerState.groupCustomerList.map(user => user._id == customerState._id ? null : (
                    <DrawerMenuItem key={user._id}>
                      <div className='drawer_menu_item' onClick={() => {
                         handleChildAccount(user._id);
                         toggleHandler();
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <NameThumbnail name={user.name} />
                          <span style={{ marginLeft: '5px' }}>{user.name}</span>
                        </div>
                      </div>
                    </DrawerMenuItem>
                  ))}
                </>
              )}
              {MOBILE_DRAWER_MENU.map((item) => (
                <DrawerMenuItem key={item.id}>
                  <NavLink
                    onClick={toggleHandler}
                    href={item.href}
                    label={item.defaultMessage}
                    intlId={item.id}
                    className='drawer_menu_item'
                  />
                </DrawerMenuItem>
              ))}
            </DrawerMenu>

            {customerState._id && (
              <UserOptionMenu>
                {/* <DrawerMenuItem>
                  <NavLink
                    href={PROFILE_PAGE}
                    label='Your Account Settings'
                    className='drawer_menu_item'
                    intlId='navlinkAccountSettings'
                  />
                </DrawerMenuItem> */}
                <DrawerMenuItem>
                  <div onClick={handleLogout} className='drawer_menu_item'>
                    <span className='logoutBtn'>
                      <FormattedMessage
                        id='nav.logout'
                        defaultMessage='Logout'
                      />
                    </span>
                  </div>
                </DrawerMenuItem>
              </UserOptionMenu>
            )}
          </DrawerContentWrapper>
        </Scrollbar>
      </DrawerBody>
    </Drawer >
  );
};

export default MobileDrawer;
