import React from 'react';
import Router, { useRouter } from 'next/router';
import { FormattedMessage } from 'react-intl';
import Popover from 'components/popover/popover';
import Logo from 'layouts/logo/logo';
import { MenuDown } from 'assets/icons/MenuDown';
import { TEMPLATE_TYPE } from 'config/site-navigation';
import * as categoryMenuIcons from 'assets/icons/category-menu-icons';
import {
  MainMenu,
  StyledIconWrapper,
  MenuItem,
  SelectedItem,
  Icon,
  Arrow,
  StyledLeftMenuBox,
} from './left-menu.style';

const CategoryIcon = ({ name }) => {
  const TagName = categoryMenuIcons[name];
  return !!TagName ? <TagName /> : <p>Invalid icon {name}</p>;
};

 const CategoryMenu = (props: any) => {
  const handleOnClick = (item) => {
    if (item.dynamic) {
      Router.push('/[type]', `${item.href}`);
      props.onClick(item);
      return;
    }
    Router.push(`${item.href}`);
    props.onClick(item);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {TEMPLATE_TYPE.map((item) => (
        <MenuItem key={item.id} {...props} onClick={() => handleOnClick(item)}>
          <StyledIconWrapper>
            <CategoryIcon name={item.icon} />
          </StyledIconWrapper>
          <FormattedMessage id={item.id} defaultMessage={item.defaultMessage} />
        </MenuItem>
      ))}
    </div>
  );
};

type Props = {
  logo: string;
};

export const LeftMenu: React.FC<Props> = ({ logo }) => {
  const router = useRouter();
  const initialMenu = TEMPLATE_TYPE.find(
    (item) => item.href === router.asPath
  );
  const [activeMenu, setActiveMenu] = React.useState(
    initialMenu ?? TEMPLATE_TYPE[0]
  );

  return (
    <StyledLeftMenuBox>
      <Logo
        imageUrl={logo}
        alt={"Egebjerg's logo"}
        // onClick={() => setActiveMenu(TEMPLATE_TYPE[0])}
      />

      <MainMenu>
        <Popover
          className="right"
          handler={
            <SelectedItem>
              <span>
                <Icon>
                  <CategoryIcon name={activeMenu?.icon} />
                </Icon>
                <span>
                  <FormattedMessage
                    id={activeMenu?.id}
                    defaultMessage={activeMenu?.defaultMessage}
                  />
                </span>
              </span>
              <Arrow>
                <MenuDown />
              </Arrow>
            </SelectedItem>
          }
          content={<CategoryMenu onClick={setActiveMenu} />}
        />
      </MainMenu>
    </StyledLeftMenuBox>
  );
};
