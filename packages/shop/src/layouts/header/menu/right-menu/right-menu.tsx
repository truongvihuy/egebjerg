import dynamic from 'next/dynamic';

import NavLink from 'components/nav-link/nav-link';
import { HELP_MENU_ITEM, TERMS_MENU_ITEM, NEWSPAPER_MENU_ITEM } from 'config/site-navigation';
import { HelpIcon } from 'assets/icons/HelpIcon';
import { RightMenuBox } from './right-menu.style';
import Popover from 'components/popover/popover';
import { FormattedMessage } from 'react-intl';


const AuthMenu = dynamic(() => import('../auth-menu'), { ssr: false });

type Props = {
  newspaperList?: any[],
};

export const RightMenu: React.FC<Props> = ({ newspaperList = [] }) => {
  let newsPaperEle = newspaperList && newspaperList.length > 1
    ? <Popover
      direction="left"
      className="menu-item"
      handler={
        <button style={{ border: '0', backgroundColor: 'initial' }}>
          <span className='menu-item can-click'>
            <FormattedMessage
              id={NEWSPAPER_MENU_ITEM.id}
              defaultMessage={NEWSPAPER_MENU_ITEM.defaultMessage}
            />
          </span>
        </button>
      }
      content={<div>
        {newspaperList.map(x => {
          return <NavLink
            className="menu-item"
            href={NEWSPAPER_MENU_ITEM.href + '?_id=' + x._id + '&page=1'}
            label={x.name}
            key={x._id}
          />
        })}
      </div>}
    />
    : (
      (newspaperList && newspaperList.length == 1)
        ? <NavLink
          className="menu-item"
          href={NEWSPAPER_MENU_ITEM.href + '?_id=' + newspaperList[0]._id}
          label={NEWSPAPER_MENU_ITEM.defaultMessage}
          intlId={NEWSPAPER_MENU_ITEM.id}
        />
        : <NavLink
          className="menu-item"
          href={NEWSPAPER_MENU_ITEM.href}
          label={NEWSPAPER_MENU_ITEM.defaultMessage}
          intlId={NEWSPAPER_MENU_ITEM.id}
        />
    );

  return (
    <RightMenuBox>
      {newsPaperEle}

      <NavLink
        className="menu-item"
        href={TERMS_MENU_ITEM.href}
        label={TERMS_MENU_ITEM.defaultMessage}
        intlId={TERMS_MENU_ITEM.id}
      />
      <hr />
      <NavLink
        className="menu-item"
        href={HELP_MENU_ITEM.href}
        label={HELP_MENU_ITEM.defaultMessage}
        intlId={HELP_MENU_ITEM.id}
        iconClass="menu-icon"
        icon={<HelpIcon />}
      />

      <AuthMenu />
    </RightMenuBox>
  );
};
