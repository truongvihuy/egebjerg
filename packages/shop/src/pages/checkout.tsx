import React, { useContext, useEffect, useState } from 'react';
import { NextPage, GetStaticProps } from 'next';
import { Modal } from '@redq/reuse-modal';
import { SEO } from 'components/seo';
import { initializeApollo } from 'utils/apollo';

import { CustomerContext } from 'contexts/customer/customer.context';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const Checkout = dynamic(
  () => import('features/checkouts/checkout'), {
  ssr: false
});

type Props = {
  deviceType: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
};
const CheckoutPage: NextPage<Props> = ({ deviceType }) => {
  const { customerState } = useContext<any>(CustomerContext);
  const [isNormalAuthenticated, setIsNormalAuthenticated] = useState(false);

  useEffect(() => {
    setIsNormalAuthenticated(customerState.isNormalAuthenticated);
  }, [customerState.isNormalAuthenticated]);

  if (isNormalAuthenticated) {
    return (
      <Modal>
        <SEO title="Checkout" description="Checkout Details" />
        <Checkout deviceType={deviceType} />
      </Modal>
    );
  }

  return <Modal />;
};

export const getStaticProps: GetStaticProps = async () => {
  const apolloClient = initializeApollo();
  // const { customerState } = useContext<any>(CustomerContext);

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
};
export default CheckoutPage;
