import React from 'react';
import Logo from 'layouts/logo/logo';
import {
  StyledLeftMenuBox,
} from './left-menu.style';

type Props = {
  logo: string;
};

export const LeftMenu: React.FC<Props> = ({ logo }) => {
  return (
    <StyledLeftMenuBox>
      <Logo
        className='desktop'
        imageUrl={logo}
        alt={"Egebjerg's logo"}
      />
    </StyledLeftMenuBox>
  );
};
