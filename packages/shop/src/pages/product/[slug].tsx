import React, { useContext, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initializeApollo } from 'utils/apollo';
import { GET_PRODUCTS } from 'graphql/query/product.query';
import { Modal } from '@redq/reuse-modal';
import ProductSingleWrapper, {
  ProductSingleContainer,
} from 'assets/styles/product-single.style';
import { SEO } from 'components/seo';
import { CustomerContext } from 'contexts/customer/customer.context';
import { checkProductStock } from '../../../../share/order.helper';

const NoResultFound = dynamic(
  () => import('components/no-result/no-result')
)

const ProductDetails = dynamic(
  () =>
    import('components/product-details/product-details')
);

const CartPopUp = dynamic(() => import('features/carts/cart-popup'), {
  ssr: false,
});

interface Props {
  data: any;
  deviceType: any;
}

export async function getServerSideProps({ params }) {
  const _id = +params.slug.split('-')[0];
  const apolloClient = initializeApollo();
  if (isNaN(_id)) {
    return {
      notFound: true,
    };
  }

  const { data } = await apolloClient.query({
    query: GET_PRODUCTS,
    variables: {
      product_id: [_id],
      is_active: null
    },
  });

  let product = data.products.items[0] ?? null;

  if (product) {
    return {
      props: {
        data: product,
      },
    };
  }

  return {
    notFound: true,
  };
}
const ProductDetailsPage = ({ data, deviceType }: Props) => {
  //get info customer
  const { customerState, customerDispatch } = useContext<any>(CustomerContext);

  if (customerState.isNormalAuthenticated && data) {
    data = {
      ...data,
      is_favorite: customerState.favorite_list?.includes(data._id),
      is_most_bought: customerState.most_bought_list?.includes(data._id),
    }
  }

  return (
    <Modal>
      {!!data && <SEO
        title={data.name}
        description={`${data.name} Details`}
      />}
      <ProductSingleWrapper>
        <ProductSingleContainer>
          {(data && customerState._id ? checkProductStock(data, customerState) : true)
            ? <ProductDetails product={data} deviceType={deviceType} />
            : <NoResultFound />}
          <CartPopUp deviceType={deviceType} />
        </ProductSingleContainer>
      </ProductSingleWrapper>
    </Modal>
  );
};
export default ProductDetailsPage;