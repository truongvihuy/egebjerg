import React, { useState } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { SEO } from 'components/seo';
import { Modal } from '@redq/reuse-modal';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { ProductGrid } from 'components/product-grid/product-grid';
import { GET_NEWSPAPER_DETAIL } from 'graphql/query/newspaper';
import config from 'config/config';

import {
  OfferPageWrapper,
  StyledContainerRow,
  StyledContainerCol,
  MainContentArea,
} from 'assets/styles/pages.style';

import {
  StyledNav,
  StyledNavButton,
  StyledInputWrapper,
  StyledInput
} from '../layouts/newspaper.style';

const ErrorMessage = dynamic(() =>
  import('components/error-message/error-message')
);

const CartPopUp = dynamic(import('features/carts/cart-popup'), { ssr: false });

type NewspaperProps = {
  deviceType: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
};

const NewsPaperPage: NextPage<NewspaperProps> = ({ deviceType }) => {
  console.info('render', 'Newspaper');

  const router = useRouter();
  const { asPath } = router;

  let params = { _id: undefined, page: 1 };
  (new URLSearchParams(asPath.slice('newspaper?'.length))).forEach((value, key) => {
    params[key] = Number.isNaN(value) ? undefined : +value;
  });

  const [pageInput, setPageInput] = useState(params.page);

  let newspaperList: any;
  if (params._id) {
    newspaperList = useQuery(GET_NEWSPAPER_DETAIL, {
      variables: {
        _id: params._id
      }
    });
  } else {
    newspaperList = useQuery(GET_NEWSPAPER_DETAIL);
  }

  if (newspaperList.error)
    return <ErrorMessage message={newspaperList.error.message} />;

  const newspaperData = newspaperList?.data?.newspapers[0];
  const productIdList = newspaperData?.offer_list.product_id_list[params.page - 1] ?? [];
  const totalPage = newspaperData?.total_page ?? 48;

  const changePage = newPage => {
    if (params.page != newPage) {
      router.push({
        pathname: '/newspaper',
        search: `?_id=${params._id ?? newspaperData._id}&page=${newPage}`
      });
      setPageInput(newPage);
    }
  }

  const handleChangePage = newPage => {
    setPageInput(newPage)
  }
  const changePagetoPageInput = e => {
    if (e.keyCode == 13) {
      router.push({
        pathname: '/newspaper',
        search: `?_id=${params._id ?? newspaperData._id}&page=${pageInput}`
      });
    }
  }

  const getUrlImagesFromNameTemplete = (newspaper, page) => {
    let img = newspaper.offer_list.img_list?.[page];
    if (img) {
      return `${config.THUMBOR_SERVER_URL}/image/${img.uid}/${img.slug}`;
    }
    return null;
  }

  return (
    <Modal>
      <SEO title='Tilbudsavis' description='Tilbudsavis' />
      <OfferPageWrapper>
        <MainContentArea>
          <StyledContainerRow>
            <StyledContainerCol className={'two-cols-container__1st-col'}>
              {
                newspaperData
                  ? (
                    <>
                      <StyledNav>
                        <StyledNavButton key='prev-slide' onClick={() => changePage(params.page - 1)} disabled={params.page <= 1}>{'<'}</StyledNavButton>
                        <StyledInputWrapper>
                          <span style={{ width: '10%', paddingRight: '10%' }}>Page</span>
                          <StyledInput type='number' value={pageInput} onChange={e => handleChangePage(e.target.value)} onKeyDown={e => changePagetoPageInput(e)} />
                          <span style={{ width: '10%', paddingRight: '10%', paddingLeft: '10px' }}> / {totalPage}</span>
                        </StyledInputWrapper>
                        <StyledNavButton key='next-slide' onClick={() => changePage(params.page + 1)} disabled={params.page >= totalPage}>{'>'}</StyledNavButton>
                      </StyledNav>
                      <img src={getUrlImagesFromNameTemplete(newspaperData, params.page - 1)} />
                    </>
                  )
                  : null
              }
            </StyledContainerCol>
            <StyledContainerCol className={'two-cols-container__2nd-col'}>
              <ProductGrid
                loadMore={true}
                query={{ product_id: productIdList }}
                styledVariant='newspaper'
              />
            </StyledContainerCol>
          </StyledContainerRow>
        </MainContentArea>
      </OfferPageWrapper>
      <CartPopUp deviceType={deviceType} />
    </Modal>
  );
};

// export const getStaticProps: GetStaticProps = async () => {
//   const apolloClient = initializeApollo();

//   await apolloClient.query({
//     query: GET_NEWSPAPER,
//   });

//   return {
//     props: {
//       initialApolloState: apolloClient.cache.extract(),
//     },
//   };
// };
export default NewsPaperPage;
