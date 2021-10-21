import React from 'react';
import { openModal, closeModal } from '@redq/reuse-modal';
import MobileDrawer from './mobile-drawer';
import {
  MobileHeaderWrapper,
  MobileHeaderInnerWrapper,
  DrawerWrapper,
  LogoWrapper,
  SearchWrapper,
  SearchModalWrapper,
  SearchModalClose,
  StyledNewspaperWrapper,
  StyledImg,
} from './header.style';
import Search from 'features/search/search';
import LogoImage from 'assets/images/logo-2.jpg';
import OfferSrc from 'assets/images/offer.png';
import { SearchIcon } from 'assets/icons/SearchIcon';
import { LongArrowLeft } from 'assets/icons/LongArrowLeft';
import Logo from 'layouts/logo/logo';
import useDimensions from 'utils/useComponentSize';
import Popover from 'components/popover/popover';
import { NEWSPAPER_MENU_ITEM } from 'config/site-navigation';
import NavLink from 'components/nav-link/nav-link';

type MobileHeaderProps = {
  className?: string;
  closeSearch?: any;
  newspaperList?: any[];
};

const SearchModal: React.FC<{ q?: string }> = (props) => {
  const onSubmit = () => {
    closeModal();
  };
  return (
    <SearchModalWrapper>
      <SearchModalClose type='submit' onClick={() => closeModal()}>
        <LongArrowLeft />
      </SearchModalClose>
      <Search
        isGlobal
        className='header-modal-search'
        showButtonText={false}
        includeSuggestion
        onSubmit={onSubmit}
        searchInputId='header-search'
      />
    </SearchModalWrapper>
  );
};

const MobileHeader: React.FC<MobileHeaderProps> = ({ className, newspaperList }) => {
  const [mobileHeaderRef, dimensions] = useDimensions();

  const handleSearchModal = () => {
    openModal({
      show: true,
      config: {
        enableResizing: false,
        disableDragging: true,
        className: 'search-modal-mobile',
        width: '100%',
        height: '100%',
      },
      closeOnClickOutside: false,
      component: SearchModal,
      closeComponent: () => <div />,
    });
  };

  return (
    <MobileHeaderWrapper>
      <MobileHeaderInnerWrapper className={className} ref={mobileHeaderRef}>
        <DrawerWrapper>
          <MobileDrawer newspaperList={newspaperList} />
        </DrawerWrapper>

        <LogoWrapper>
          <Logo imageUrl={LogoImage} alt='shop logo' className='mobile' />
        </LogoWrapper>

        <StyledNewspaperWrapper>
          <Popover
            direction="right"
            handler={
              <StyledImg src={OfferSrc} alt='Tilbud' title='Tilbud' />
            }
            content={newspaperList.map(newspaper => (
              <NavLink
                key={newspaper._id}
                className="menu-item"
                href={NEWSPAPER_MENU_ITEM.href + '?_id=' + newspaper._id + '&page=1'}
                label={newspaper.name}
              />
            ))}
          />
        </StyledNewspaperWrapper>

        <SearchWrapper
          onClick={handleSearchModal}
          className='searchIconWrapper'
        >
          <SearchIcon />
        </SearchWrapper>
      </MobileHeaderInnerWrapper>
    </MobileHeaderWrapper>
  );
};

export default MobileHeader;
