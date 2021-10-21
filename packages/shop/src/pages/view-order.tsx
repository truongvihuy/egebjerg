import { GET_PRODUCTS } from 'graphql/query/product.query';
import { initializeApollo } from 'utils/apollo';
import styled from 'styled-components';
import css from '@styled-system/css';
import { GET_ORDER_BY_SESSION } from 'graphql/query/order.query';
import { SEO } from 'components/seo';
import OrderConfirm from 'features/order-confirm/order-confirm';
import Footer from 'layouts/footer';
import { PageWrapper } from 'features/user-profile/user-profile.style';

export const getServerSideProps = async ({ query }) => {
  const apolloClient = initializeApollo();

  const { data } = await apolloClient.query({
    query: GET_ORDER_BY_SESSION,
    variables: {
      session: query.code,
    },
  });

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      order: data.orderBySession,
    },
  };
};

export default function CategoryPage({ order, deviceType }) {

  return (
    <>
      <SEO title="Invoice" description="Invoice Details" />
      <PageWrapper>
        <OrderConfirm order={order} />
      </PageWrapper>
      <Footer />
    </>
  );
}
