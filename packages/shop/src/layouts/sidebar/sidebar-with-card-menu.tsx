
import dynamic from 'next/dynamic';
import React from 'react';
import { CardMenu } from 'components/card-menu';
import styled from 'styled-components';
import systemCss from '@styled-system/css';
import { Scrollbar } from 'components/scrollbar/scrollbar';
import { Previous } from 'assets/icons/Previous';
import { FormattedMessage } from 'react-intl';
import { useSideBar } from 'utils/useSideBar';

const SidebarLoader = dynamic(() => import('layouts/sidebar/sidebar.loader').then((mod) => mod.SidebarLoader), {
  ssr: false,
});

const SidebarMobileLoader = dynamic(() => import('layouts/sidebar/sidebar.loader').then((mod) => mod.SidebarMobileLoader), {
  ssr: false,
});

const Aside = styled.aside({
  width: '300px',
  position: 'fixed',
  top: 110,
  left: 30,
  height: 'calc(100% - 180px)',
});

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
const MobileOnly = styled.div({
  display: 'none',
  zIndex: 10,

  '@media (max-width: 990px)': {
    display: 'block',
  },
});

const DesktopOnly = styled.div({
  display: 'none',
  '@media (min-width: 991px)': {
    display: 'block',
  },
});

interface Props {
  deviceType: {
    mobile: string;
    tablet: string;
    desktop: boolean;
  };
  categoryId?: number;
  query?: any;
}

export const SidebarWithCardMenu = ({ categoryId = 0, query = {}, deviceType }: Props) => {
  const {
    categoryMap,
    onClickBack,
    onCategoryClick,
    currentCategoryListParentId,
  } = useSideBar(categoryId, query);

  return (
    <React.Fragment>
      {/* <MobileOnly>
        <Sticky top={67}>
          <CategoryWalker
            style={{
              backgroundColor: '#ffffff',
              paddingTop: '15px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            }}
          >
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
          </CategoryWalker>
        </Sticky>
      </MobileOnly> */}

      <DesktopOnly>
        {!categoryMap ? <SidebarLoader /> : (
          <Aside id='category-menu'>
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
            <Scrollbar
              style={{ height: '100%', maxHeight: '100%', padding: '10px 10px 10px 0' }}
              options={{
                scrollbars: {
                  visibility: 'auto',
                  autoHide: 'never',
                },
              }}
            >

              <CardMenuWrapper>
                <CardMenu
                  currentCategory={categoryMap[currentCategoryListParentId] ?? categoryMap[0]}
                  categoryMap={categoryMap}
                  onClick={onCategoryClick}
                  activeId={categoryId}
                />
              </CardMenuWrapper>
            </Scrollbar>
          </Aside>
        )}
      </DesktopOnly>
    </React.Fragment>
  );
};
