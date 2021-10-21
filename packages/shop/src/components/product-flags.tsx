import styled from 'styled-components';
import { Freeze } from 'assets/icons/Freeze';
import { Ecology } from 'assets/icons/Ecology';
import { Star } from 'assets/icons/Star';
import XtraSrc from 'assets/images/xtra.png';
import { CircleOfferBadge } from './offer-badge/offer-badge';
import { CircleOutOfStockBadge } from './out-of-stock-badge/out-of-stock-badge';
import { useContext, useState } from 'react'
import { CustomerContext } from 'contexts/customer/customer.context';
import { useMutation } from '@apollo/client';
import { ADD_FAVORITE_PRODUCT, REMOVE_FAVORITE_PRODUCT } from 'graphql/mutation/favorite';
import { useIntl } from 'react-intl';
const StyledProductFlag = styled.div`
  svg {
    margin: 2px;
  }

  &.card-item {
    padding: 1rem;
    text-align: right;
    overflow: hidden;
  }

  @keyframes favorite {
    0% {fill: #ffc107;}
    20% {fill: #e8cb75;}
    50% {fill: #767676;}
    75% {fill: #e8cb75;}
    100% {fill: #ffc107;}
  }

  .is-no-favorite, .is-favorite {
    &:hover path {
      fill: #ffc107;
      animation: favorite 2s infinite;
    }
  }
`;
const StyledXtra = styled.img<any>({
  height: 25,
});

export const ProductFlags = ({ data, offer = null, className = '' }) => {
  const intl = useIntl();
  const { customerState, customerDispatch } = useContext<any>(CustomerContext);

  let productData = { ...data };
  console.info('render', 'ProductFlags: p' + productData._id + ' | customerState.isNormalAuthenticated = ' + customerState.isNormalAuthenticated);

  const [removeFavoriteMutation] = useMutation(REMOVE_FAVORITE_PRODUCT);
  const [addFavoriteMutation] = useMutation(ADD_FAVORITE_PRODUCT);

  const handleAddFavoriteProduct = async (item) => {
    addFavoriteMutation(
      {
        variables: {
          product_id: item._id
        }
      }
    ).then((response) => {
      if (response.data) {
        customerDispatch({ type: 'ADD_FAVORITE_PRODUCT', payload: item._id });
      }
    });
  };
  const handleRemoveFavoriteProduct = (item) => {
    removeFavoriteMutation(
      {
        variables: {
          product_id: item._id
        }
      }
    ).then((response) => {
      if (response.data) {
        customerDispatch({ type: 'REMOVE_FAVORITE_PRODUCT', payload: item._id });
      }
    });
  };

  productData.is_favorite = customerState.favorite_list?.includes(productData._id);
  productData.is_most_bought = customerState.most_bought_list?.includes(productData._id);

  return (
    <StyledProductFlag className={className}>
      {
        offer ? (
          <div style={{ position: 'absolute', zIndex: 1 }}>
            <CircleOfferBadge offer={offer} />
          </div>
        ) : null
      }
      {productData.is_coop_xtra ? (
        <StyledXtra src={XtraSrc} alt='Xtra' title='Xtra' />
      ) : null}
      {productData.is_ecology ? <Ecology title='Økologi' /> : null}
      {productData.is_frozen ? <Freeze title='Frost' /> : null}
      {
        customerState.isNormalAuthenticated ?
          (
            productData.is_favorite ? (
              <Star className="is-favorite can-click" onClick={e => { e.preventDefault(); handleRemoveFavoriteProduct(data) }}
                title='Favorit - Klik for at fjerne elementet fra dine favoritter' />
            ) : productData.is_most_bought ? (
              <Star className='is-no-favorite can-click' onClick={e => { e.preventDefault(); handleAddFavoriteProduct(data) }}
                color='#2e70fa' title='Mest købte - Klik for at fjerne varen fra dine favoritter' />
            ) : (
              <Star className='is-no-favorite can-click' onClick={e => { e.preventDefault(); handleAddFavoriteProduct(data) }}
                color='#767676' title='Klik for at fjerne varen fra dine favoritter' />
            )
          ) : null
      }
    </StyledProductFlag>
  );
};

export default ProductFlags;
