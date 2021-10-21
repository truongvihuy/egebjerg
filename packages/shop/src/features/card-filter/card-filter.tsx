import React, { useContext, ComponentType, useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import css from '@styled-system/css';
import Sticky from 'react-stickynode';
import XtraSrc from 'assets/images/xtra.png';
import OfferSrc from 'assets/images/offer.png';
import { Freeze } from 'assets/icons/Freeze';
import { Ecology } from 'assets/icons/Ecology';
import { Star } from 'assets/icons/Star';
import { CustomerContext } from 'contexts/customer/customer.context';
import { Button } from 'components/button/button';
import { FormattedMessage } from 'react-intl';
import SpringModal from 'components/spring-modal/spring-modal';
import systemCss from '@styled-system/css';
import { CardMenu } from 'components/card-menu';
import { Previous } from 'assets/icons/Previous';
import { useSideBar } from 'utils/useSideBar';

const Sorting: ComponentType<any> = dynamic(() => import('features/select-sort/select-sort'), {
  ssr: false,
});

const CheckBox = dynamic(() => import('components/checkbox/checkbox'), {
  ssr: false,
});

const SidebarMobileLoader = dynamic(() => import('layouts/sidebar/sidebar.loader').then((mod) => mod.SidebarMobileLoader), {
  ssr: false,
});

const StyledFilterImg = styled.img({
  height: 20,
});

const StyledFilterLabel = styled.div<any>(
  css({
    '@media (max-width: 580px)': {
      flexBasis: '100%',
      marginBottom: '5px'
    }
  }),
);

const StyledCardFilterWrapper = styled.div`
  z-index: 10;

  .sticky-outer-wrapper {
    transition-duration: .3s;
  }
`;

const StyledCardFilterInnerWrapper = styled.div`
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #f3f3f3;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 20px;
  margin-bottom: 25px;
  font-weight: bold;

  @media (max-width: 580px) {
    padding: 10px 15px;
    margin-bottom: 10px;
  }

  @media (max-width: 411px) {
    padding: 10px;
  }
`;


const StyledFilterWrapper = styled.div`
  flex-grow: 1;
`;

const StyledFilterInnerWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  @media (max-width: 580px) {
    justify-content: space-between;
  }
`;

const ButtonGroup = styled.div({
  padding: '0px 10px 10px 0px',
});
const BackButton = styled.div((props) => systemCss({
  textAlign: 'center',
  padding: '10px',
  backgroundColor: '#fff',
  borderTopLeftRadius: '6px',
  borderTopRightRadius: '6px',
  transition: '0.3s ease-in-out',
  cursor: props.onClick ? 'pointer' : 'default',
  fontWeight: 'bold',

  ':hover': props.onClick ? {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    color: 'primary.hover',
  } : {},
}));
const CardMenuWrapper = styled.div({
  display: 'grid',
  gridGap: '10px',
  gridTemplateColumns: '1fr 1fr',
  gridAutoRows: 'max-content',
  paddingBottom: 30,

  '@media (min-width: 550px) and (max-width: 990px)': {
    gridTemplateColumns: '1fr 1fr 1fr',
  },
});

const Filter = (props) => {
  const { customerState } = useContext<any>(CustomerContext);

  return (
    <StyledFilterWrapper>
      <StyledFilterLabel>Filter: </StyledFilterLabel>
      <StyledFilterInnerWrapper>
        <CheckBox id='is_coop_xtra' subInfoText='Xtra' labelText={<StyledFilterImg src={XtraSrc} alt='Xtra' title='Xtra' />}
          checked={props.filter.is_coop_xtra} onChange={props.onChange} />
        <CheckBox id='is_ecology' subInfoText='Økologi' labelText={<Ecology />}
          checked={props.filter.is_ecology} onChange={props.onChange} />
        <CheckBox id='is_frozen' subInfoText='Frost' labelText={<Freeze />}
          checked={props.filter.is_frozen} onChange={props.onChange} />
        <CheckBox id='is_offer' subInfoText='Tilbud' labelText={<StyledFilterImg src={OfferSrc} alt='Tilbud' title='Tilbud' />}
          checked={props.filter.is_offer} onChange={props.onChange} />
        {
          customerState.isNormalAuthenticated ? (
            <>
              <CheckBox id='is_favorite' subInfoText='Favorit' labelText={<Star title='Favorit' />}
                checked={props.filter.is_favorite} onChange={props.onChange} />
              <CheckBox id='is_most_bought' subInfoText='Mest købte' labelText={<Star color='#2e70fa' title='Mest købte' />}
                checked={props.filter.is_most_bought} onChange={props.onChange} />
            </>
          ) : null
        }
      </StyledFilterInnerWrapper>
    </StyledFilterWrapper>
  )
};

const CardFilter = ({ categoryId = 0, query = {} as any, onChangeFilter, onChangeSort, deviceType }) => {
  const [isOpen, setOpen] = useState(false);
  const {
    categoryMap,
    onClickBack,
    onCategoryClick,
    currentCategoryListParentId,
  } = useSideBar(categoryId, query);
  const pageYOffsetRef = useRef(0);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!deviceType.desktop) {
      const handleStickyFilter = () => {
        let isSticky = false;
        if (pageYOffsetRef.current > window.pageYOffset) {
          isSticky = true;
        }
        pageYOffsetRef.current = window.pageYOffset;
        setEnabled(isSticky)
      }
      document.addEventListener('scroll', handleStickyFilter);
      return () => {
        document.removeEventListener('scroll', handleStickyFilter);
      }
    }
  }, [deviceType]);

  return (
    <React.Fragment>
      {deviceType.desktop ? (
        <StyledCardFilterInnerWrapper className='desktop'>
          <Filter filter={query} onChange={onChangeFilter} />
          <Sorting sort={query.sort} onChange={onChangeSort} />
        </StyledCardFilterInnerWrapper>
      ) : (
        <StyledCardFilterWrapper>
          <Sticky top={60} enabled={enabled}>
            <StyledCardFilterInnerWrapper className='mobile'>
              <Filter filter={query} onChange={onChangeFilter} />
              <Sorting sort={query.sort} onChange={onChangeSort}>
                <Button style={{ height: 'auto' }} variant='text' onClick={() => setOpen(true)}>
                  Filter kategori
                </Button>
                <SpringModal isOpen={isOpen} onRequestClose={() => setOpen(false)}>
                  <ButtonGroup>
                    {currentCategoryListParentId !== 0 ? (
                      <BackButton onClick={onClickBack}>
                        <Previous /> <FormattedMessage id="back" defaultMessage="Back" />
                      </BackButton>
                    ) : (
                      <BackButton>
                        <FormattedMessage id="menu" defaultMessage="Menu" />
                      </BackButton>
                    )}
                  </ButtonGroup>
                  <CardMenuWrapper>
                    {!categoryMap ? <SidebarMobileLoader /> :
                      <CardMenu
                        currentCategory={categoryMap[currentCategoryListParentId] ?? categoryMap[0]}
                        categoryMap={categoryMap}
                        onClick={onCategoryClick}
                        activeId={categoryId}
                      />
                    }
                  </CardMenuWrapper>
                </SpringModal>
              </Sorting>
            </StyledCardFilterInnerWrapper>
          </Sticky>
        </StyledCardFilterWrapper>
      )}
    </React.Fragment>
  )
};

export default CardFilter;