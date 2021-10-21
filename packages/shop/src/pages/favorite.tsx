import React, { useEffect, useState, useContext } from 'react';
import { Modal } from '@redq/reuse-modal';
import { NextPage } from 'next';
import { SEO } from 'components/seo';
import { useRouter } from 'next/router';
import { parseUrlParams } from 'utils/parse-url-params';
import ProductGridWithSearchBar from 'components/product-grid-with-search-bar';
import { CustomerContext } from 'contexts/customer/customer.context';


type FavoriteProps = {
  deviceType: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
};

const FavoritePage: NextPage<FavoriteProps> = ({ deviceType }) => {
  //get info customer
  const { customerState } = useContext<any>(CustomerContext);
  const router = useRouter();
  const { asPath } = router;
  const [isNormalAuthenticated, setIsNormalAuthenticated] = useState(false);

  useEffect(() => {
    setIsNormalAuthenticated(customerState.isNormalAuthenticated);
  }, [customerState.isNormalAuthenticated]);

  let productIdList = customerState.favorite_list ?? [];
  productIdList = [...new Set(productIdList)];

  let { query } = parseUrlParams(asPath);
  if (isNormalAuthenticated) {
    return (
      <Modal>
        <SEO title='Favorit' description='Favorit' />
        <ProductGridWithSearchBar idPlaceHolder='searchFavoritePlaceholder' query={query} productIdList={productIdList} deviceType={deviceType} searchInputId='favorite-search' />
      </Modal>
    );
  }

  return <Modal />;
};
export default FavoritePage;
