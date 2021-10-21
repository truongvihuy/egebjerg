import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import css from '@styled-system/css';

import ErrorMessage from 'components/error-message/error-message';
import { useQuery, NetworkStatus, empty } from '@apollo/client';
import { GET_PRODUCTS } from 'graphql/query/product.query';
import { Button } from 'components/button/loadmore-button';
import { FormattedMessage } from 'react-intl';
import { Box } from 'components/box';
import NoResultFound from 'components/no-result/no-result';
import { StyledGrid } from './product-grid.style';
import { ProductCard } from 'components/product-card/product-card';
import ProductsLoader from 'components/product-card/product-card.loader';
import { CustomerContext } from 'contexts/customer/customer.context';
interface Props {
  loadMore?: boolean;
  fetchLimit?: number;
  query?: any;
  style?: any;
  styledVariant?: string;
}

export const ProductGrid = ({
  loadMore = true,
  fetchLimit = 16,
  query,
  style,
  styledVariant,
}: Props) => {
  console.info('render', `ProductGrid | styledVariant: ${styledVariant} | query: `, query);
  const [items, setItems] = useState([]);
  const { customerState } = useContext<any>(CustomerContext);
  const { data, error, loading, fetchMore, networkStatus } = useQuery(
    GET_PRODUCTS,
    {
      variables: {
        ...query,
        offset: 0,
        limit: fetchLimit,
        isMembership: !!customerState.membership_number
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  const handleLoadMore = async () => {
    if (loading == true || loadMore == false) {
      return;
    } else {
      if (items.length > 0) {
        fetchMore({
          variables: {
            offset: items.length,
          },
        });
      }
    }
  };

  //When scroll and reach 90%, load more automatically
  const loadMoreOnScroll = async () => {
    let scrolled = window.innerHeight + document.documentElement.scrollTop;
    let scrollHeight = document.scrollingElement.scrollHeight;
    let check = (scrolled != scrollHeight) && (scrolled >= 0.9 * scrollHeight);
    if (check) {
      window.removeEventListener('scroll', loadMoreOnScroll)
      await handleLoadMore();
    }
  }
  const loadingMore = networkStatus === NetworkStatus.fetchMore;

  useEffect(() => {
    window.addEventListener('scroll', loadMoreOnScroll)
    return () => {
      window.removeEventListener('scroll', loadMoreOnScroll)
    };
  }, [items]);

  useEffect(() => {
    if (data && data.products && data.products.items) {
      setItems(data.products.items);
    }
  }, [data?.products?.items]);

  if (error) return <ErrorMessage message={error.message} />;
  if (loading && !loadingMore) {
    return <ProductsLoader />;
  }
  if (!data || !data.products || data.products.items.length === 0) {
    return <NoResultFound />;
  }

  let hasMore = data.products.hasMore;
  return (
    <>
      <StyledGrid style={style} variant={styledVariant}>
        {items.map((product, idx) => (
          <ProductCard data={product} key={product._id} disableClickOnInlineOfferBadge={false} />
        ))}
      </StyledGrid>

      {loadMore && hasMore && (
        <Box style={{ textAlign: 'center' }} mt={'2rem'}>
          <Button
            onClick={handleLoadMore}
            loading={loadingMore}
            variant="secondary"
            style={{
              fontSize: 14,
              display: 'inline-flex',
            }}
            border="1px solid #f1f1f1"
          >
            <FormattedMessage id="loadMoreButton" defaultMessage="Load More" />
          </Button>
        </Box>
      )}
    </>
  )
};
