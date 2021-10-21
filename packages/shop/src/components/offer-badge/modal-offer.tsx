import { NetworkStatus, useQuery } from '@apollo/client';
import ErrorMessage from 'components/error-message/error-message';
import { GET_PRODUCTS } from 'graphql/query/product.query';
import ProductsLoader from 'components/product-card/product-card.loader';
import NoResultFound from 'components/no-result/no-result';
import styled from 'styled-components';
import css from '@styled-system/css';
import { ProductCard } from 'components/product-card/product-card';
import { useContext } from 'react';
import { CustomerContext } from 'contexts/customer/customer.context';
import { FormattedNumber } from 'react-intl';
import { CURRENCY, OFFER_TYPE, OFFER_TYPE_CONFIG } from 'config/constant';

const StyledSection = styled.section(
  css({
    padding: '10px 10px',

    '@media screen and (min-width: 768px)': {
      padding: '40px 60px',
    },
  })
)

const StyledTitle = styled.h5<any>((props) =>
  css({
    color: 'green.regular',
    textAlign: 'center',
    padding: '0 0 20px',
    fontWeight: 'bold',
    width: `${props.itemsLength * 240}px`,
  })
);

const StyledGrid = styled.div<any>((props) =>
  css({
    display: 'grid',
    gridGap: '10px',
    gridTemplateColumns: `repeat(${Math.min(props.itemsLength, 1)}, 1fr)`,
    // justifyContent: 'center',
    width: `${props.itemsLength * 270}px`,

    '@media screen and (min-width: 630px)': {
      gridTemplateColumns: `repeat(${Math.min(props.itemsLength, 2)}, 1fr)`,
      maxWidth: `490px`,
    },

    '@media screen and (min-width: 768px)': {
      gridTemplateColumns: `repeat(${Math.min(props.itemsLength, 3)}, 1fr)`,
      maxWidth: `740px`,
    },

    '@media screen and (min-width: 991px)': {
      gridTemplateColumns: `repeat(${Math.min(props.itemsLength, 3)}, 1fr)`,
      maxWidth: `740px`,
    },

    '@media screen and (min-width: 1200px)': {
      gridTemplateColumns: `repeat(${Math.min(props.itemsLength, 4)}, 1fr)`,
      maxWidth: `990px`,
    },

    '@media screen and (min-width: 1700px)': {
      gridTemplateColumns: `repeat(${Math.min(props.itemsLength, 5)}, 1fr)`,
      maxWidth: `1240px`,
    },

    '@media screen and (min-width: 1900px)': {
      gridTemplateColumns: `repeat(${Math.min(props.itemsLength, 6)}, 1fr)`,
      maxWidth: `1490px`,
    },
  })
);

interface Props {
  offer: any;
  fetchLimit?: number;
  disabledClickOffer?: boolean;
}
/**
 * Just used for LIMIT_COMBO and COMBO
 */
const ModalOffer = ({
  offer,
  fetchLimit = 16,
}: Props) => {
  const { customerState } = useContext<any>(CustomerContext);
  const { data, error, loading, networkStatus } = useQuery(
    GET_PRODUCTS,
    {
      variables: {
        offset: 0,
        product_id: offer.product_id,
        limit: fetchLimit,
      },
      // notifyOnNetworkStatusChange: true,
    }
  );
  const loadingMore = networkStatus === NetworkStatus.fetchMore;
  if (error) return <ErrorMessage message={error.message} />;
  if (loading && !loadingMore) {
    return <ProductsLoader />;
  }
  if (!data || !data.products || data.products.items.length === 0) {
    return <NoResultFound />;
  }
  const { items } = data.products;
  const modalTitle = offer.type === OFFER_TYPE.LIMIT_COMBO
    ? (<>MAX KØB til tilbudspris {offer.quantity} stk.<br /> Gælder for disse varianter:</>)
    : (offer.type === OFFER_TYPE.QUANTITY || offer.type === OFFER_TYPE.COMBO
      ? (<>Vælg {offer.quantity} varer fra dette udvalg for {CURRENCY} <FormattedNumber value={offer.sale_price} currency={CURRENCY} /></>)
      : OFFER_TYPE_CONFIG[offer.type].modalTitle
    );
  return (
    <StyledSection>
      <StyledTitle itemsLength={items.length}>{modalTitle}</StyledTitle>
      <StyledGrid itemsLength={items.length}>
        {items.map((product, idx) => (
          <ProductCard data={product} disableClickOnInlineOfferBadge={true} key={product._id} />
        ))}
      </StyledGrid>
    </StyledSection>
  )
}

export default ModalOffer;