import React, { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import NavLink from 'components/nav-link/nav-link';
import { AUTHORIZED_MENU_ITEMS, CUSTOMER_LIST_MENU_ITEM } from 'config/site-navigation';
import { CustomerContext } from 'contexts/customer/customer.context';
import { Scrollbar } from 'components/scrollbar/scrollbar';
import { customerReducer } from 'contexts/customer/customer.reducer';
import NameThumbnail from 'components/name-thumbnail/name-thumbnail';
import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

type Props = {
};

const UserOptionMenu = styled.div`
  border-top: 1px solid ${themeGet('colors.gray.700', '#e6e6e6')};
`;

export const AuthorizedMenu: React.FC<Props> = () => {
  const {
    handleLogout,
    handleChildAccount,
    handleParentAccount,
  } = customerReducer();
  const { customerState } = useContext<any>(CustomerContext);
  console.log(customerState);

  if (!(customerState.isNormalAuthenticated || customerState.isGroupAuthenticated)) {
    return null;
  }

  const MAX_SCROLL_BAR_HEIGHT = 280;
  let groupCustomerListEle = null;
  let groupCustomerListScrollBarHeight = MAX_SCROLL_BAR_HEIGHT; // Max height = 70 * 4 = 280px;
  if (customerState.isGroupAuthenticated) {
    groupCustomerListEle = customerState.groupCustomerList.map(user => {
      if (user._id == customerState._id) {
        return null
      }

      return (
        <div key={user._id} className='user-item can-click' style={{ display: 'flex', justifyContent: 'start' }} onClick={
          () => handleChildAccount(user._id)
        }>
          <NameThumbnail name={user.name} />
          <span style={{ marginLeft: '5px' }}>{user.name}</span>
        </div>
      )
    });

    if (customerState.groupCustomerList.length < 4) {
      groupCustomerListScrollBarHeight = customerState.isNormalAuthenticated ? (customerState.groupCustomerList.length - 1) * 70 : customerState.groupCustomerList.length * 70;
    }
  }

  return (
    <>
      <div className='user-name'>{customerState.name}</div>
      {
        customerState._id && customerState.isNormalAuthenticated && (
          <div>
            {AUTHORIZED_MENU_ITEMS.map((item, idx) => (
              <NavLink
                key={idx}
                className='menu-item'
                href={item.href}
                label={item.defaultMessage}
                intlId={item.id}
              />
            ))}
          </div>
        )
      }
      {
        customerState._id && customerState.isGroupAuthenticated && (
          <div>
            <div className='menu-item' onClick={
              () => handleParentAccount(CUSTOMER_LIST_MENU_ITEM.href)
            }>
              <a>
                <span className="label">
                  <FormattedMessage
                    id={CUSTOMER_LIST_MENU_ITEM.id}
                    defaultMessage={CUSTOMER_LIST_MENU_ITEM.defaultMessage}
                  />
                </span>
              </a>
            </div>

            {
              groupCustomerListScrollBarHeight > MAX_SCROLL_BAR_HEIGHT ? (
                <Scrollbar
                  style={{
                    height: groupCustomerListScrollBarHeight + "px",
                    borderBottom: '1px solid #F7F7F7'
                  }}
                  options={{
                    scrollbars: {
                      visibility: 'hidden',
                    },
                  }}
                >
                  {groupCustomerListEle}
                </Scrollbar>
              ) : (<>{groupCustomerListEle}</>)
            }
          </div>
        )
      }
      <UserOptionMenu>
        <div className='menu-item' onClick={handleLogout}>
          <a>
            <span>
              <FormattedMessage id='nav.logout' defaultMessage='Logout' />
            </span>
          </a>
        </div>
      </UserOptionMenu>
    </>
  );
};
