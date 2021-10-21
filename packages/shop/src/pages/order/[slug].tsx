import React, { useState, useEffect, useContext } from 'react';
import { SEO } from 'components/seo';
import Order from 'features/user-profile/order/order';
import {
  PageWrapper,
} from 'features/user-profile/user-profile.style';
import { Modal } from '@redq/reuse-modal';
import dynamic from 'next/dynamic';
import { CustomerContext } from 'contexts/customer/customer.context';
import { useRouter } from 'next/router';

const CartPopUp = dynamic(() => import('features/carts/cart-popup'), {
  ssr: false,
});

export async function getServerSideProps({ params }) {
  const order_id = +params.slug;
  return {
    props: {
      order_id,
    },
  };
}
const OrderPage = ({ deviceType, order_id = null }) => {
  const { customerState } = useContext<any>(CustomerContext);

  const [isNormalAuthenticated, setIsNormalAuthenticated] = useState(false);

  useEffect(() => {
    setIsNormalAuthenticated(customerState.isNormalAuthenticated);
  }, [customerState.isNormalAuthenticated]);
  if (isNormalAuthenticated) {
    return (
      <Modal>
        <SEO title="Order" description="Order Details" />
        <PageWrapper>
          {customerState.isNormalAuthenticated && <Order order_id={order_id} deviceType={deviceType} />}
        </PageWrapper>
        <CartPopUp deviceType={deviceType} />
      </Modal>
    );
  }

  return <Modal />;
};

export default OrderPage;
