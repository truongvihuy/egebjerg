import { withRouter } from 'next/router';
import { FormattedMessage } from 'react-intl';
import NavLink from 'components/nav-link/nav-link';
import { useState } from 'react';

type NavLinkDropdownProps = {
  router: any,
  item: any,
  onClick?: () => void;
  className?: string;
  classNameSubItem?: string;
};

const NavLinkDropdown: React.FC<NavLinkDropdownProps> = ({ item, router, onClick, classNameSubItem, className }) => {
  const isCurrentPath = router.pathname === item.href || router.asPath === item.href;
  // const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* <div onClick={onClick} className={className}>
        <div className={isCurrentPath ? ' current-page' : ''} role='button'>
          <FormattedMessage defaultMessage={item.defaultMessage} id={item.id} />
        </div>
      </div> */}
      <NavLink
        onClick={onClick}
        href={item.href}
        label={item.defaultMessage}
        className={className}
        intlId={item.id}
      />
      {item.data.map((ele, index) => (
        <NavLink
          key={index}
          onClick={onClick}
          href={ele.href}
          label={ele.label}
          className={classNameSubItem}
        />
      ))}
    </>
  )
};

export default withRouter(NavLinkDropdown);