import React from 'react';
import { SEO } from 'components/seo';
import OrderReceived from 'features/order-received/order-received';
import Footer from 'layouts/footer';

const OrderReceivedPage = () => {
  return (
    <>
      <SEO title="Invoice" description="Invoice Details" />
      <OrderReceived />
      <Footer />
    </>
  );
};

export default OrderReceivedPage;
