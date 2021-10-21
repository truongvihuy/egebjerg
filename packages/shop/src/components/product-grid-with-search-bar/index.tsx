import React, { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import css from '@styled-system/css';
import { themeGet } from '@styled-system/theme-get';
import { ProductGrid } from 'components/product-grid/product-grid';
import Search from 'features/search/search';
import { parseUrlParams, pushQueryToUrlParams } from 'utils/parse-url-params';
import { useRouter } from 'next/router';
const Sorting: ComponentType<any> = dynamic(() => import('features/select-sort/select-sort'), {
  ssr: false,
});
const CartPopUp = dynamic(() => import('features/carts/cart-popup'), {
  ssr: false,
});

const ContentArea = styled.div<any>(
  css({
    overflow: 'hidden',
    padding: ['50px 0 100px', '120px 0 50px', '110px 2rem 50px'],
    display: 'grid',
    gridRowGap: ['15px', '20px', '20px'],
    backgroundColor: 'backgroundGray',
  })
);

const StyledNav = styled.div`
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #f3f3f3;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 20px;
  margin-bottom: 25px; 
  font-weight: bold;
`;

const StyledSearchWrapper = styled.div`
  width: 100%;

  @media (min-width: 990px) {
    width: 50%;
  }
`;

const ProductGridWithSearchBar = ({ query, idPlaceHolder, productIdList, deviceType, searchInputId }) => {
  const router = useRouter();
  const { asPath, pathname } = router;

  const onChangeSort = (event) => {
    if (event.value == query.sort) {
      return
    }
    const tmpRouter = {
      pathname,
      params: pushQueryToUrlParams({
        ...query,
        sort: event.value,
      }),
    };
    router.push(tmpRouter.pathname, `${asPath.split('?')[0]}${tmpRouter.params ? `?${tmpRouter.params}` : ''}`);
  }
  return <>
    <ContentArea>
      <StyledNav>
        <StyledSearchWrapper>
          <Search idPlaceHolder={idPlaceHolder} minimal={true} className="searchBox" q={query.q} productIdList={productIdList} searchInputId={searchInputId}/>
        </StyledSearchWrapper>
        <Sorting sort={query.sort} onChange={onChangeSort} />
      </StyledNav>
      <ProductGrid
        loadMore={true}
        query={{
          product_id: productIdList,
          ...query,
        }}
        styledVariant='fullWidth'
      />
    </ContentArea>
    <CartPopUp deviceType={deviceType} />
  </>
}
export default ProductGridWithSearchBar;