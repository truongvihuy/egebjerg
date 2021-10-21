import React, { useEffect, useState, useContext } from 'react';
import { NextPage } from 'next';
import { Modal } from '@redq/reuse-modal';
import { SEO } from 'components/seo';
import { useRouter } from 'next/router';
import { parseUrlParams } from 'utils/parse-url-params';
import ProductGridWithSearchBar from 'components/product-grid-with-search-bar';
import { CustomerContext } from 'contexts/customer/customer.context';

type MostBoughtProps = {
  deviceType: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
};

const MostBoughtPage: NextPage<MostBoughtProps> = ({ deviceType }) => {
  //get info customer
  const { customerState } = useContext<any>(CustomerContext);
  const router = useRouter();
  const { asPath } = router;

  const [isNormalAuthenticated, setIsNormalAuthenticated] = useState(false);

  useEffect(() => {
    setIsNormalAuthenticated(customerState.isNormalAuthenticated);
  }, [customerState.isNormalAuthenticated]);

  let productIdList = customerState.most_bought_list ?? [];
  productIdList = [...new Set(productIdList)];

  let { query } = parseUrlParams(asPath);
  if (isNormalAuthenticated) {
    return (
      <Modal>
        <SEO title='Mest købte' description='Mest købte' />
        <ProductGridWithSearchBar idPlaceHolder='searchMostBoughtPlaceholder' query={query} productIdList={productIdList} deviceType={deviceType} searchInputId='most-bought-search' />
      </Modal>
    );
  }

  return <Modal />;
};
export default MostBoughtPage;
