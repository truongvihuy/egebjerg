import React, { useEffect, useContext } from 'react';
import Router, { useRouter } from 'next/router';

import { Button } from 'components/button/button';
import { FormattedMessage } from 'react-intl';
import Popover from 'components/popover/popover';
import NameThumbnail from 'components/name-thumbnail/name-thumbnail';
import { AuthorizedMenu } from './authorized-menu';
import { CustomerContext } from 'contexts/customer/customer.context';
import { customerReducer } from 'contexts/customer/customer.reducer';
import styled from 'styled-components';

interface Props {
}

const StyledAvatarButton = styled.button`
  height: 50px;
  padding: 0px;
  overflow: hidden;
  border: 0;
  border-radius: 50%;
`

const AuthMenu = () => {
  const { customerState } = useContext<any>(CustomerContext);
  const { pathname } = useRouter();

  const {
    handleJoin,
  } = customerReducer();

  useEffect(() => {
    let isLogedIn = typeof window !== 'undefined' ? localStorage.getItem('isLogedIn') : null;
    if (!isLogedIn) {
      handleJoin();
    }
  }, []);

  const avatar = (src, name) => {
    return src ? <StyledAvatarButton className="can-click"> <img src={src} alt="user" /> </StyledAvatarButton> : <NameThumbnail name={name} />;
  }
  if (customerState._id) {
    return <Popover
      direction="right"
      className="user-pages-dropdown"
      handler={avatar(customerState.avatar, customerState.name)}
      content={<AuthorizedMenu />}
    />
  } else {
    return <Button variant="primary" onClick={handleJoin}>
      <FormattedMessage id="joinButton" defaultMessage="join" />
    </Button>
  }
};
export default AuthMenu;
