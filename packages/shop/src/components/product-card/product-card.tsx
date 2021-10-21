import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import css from '@styled-system/css';
import { Box } from 'components/box';
import Image from 'components/image/next-image';
import { CURRENCY, PER_KG, WEIGHT } from 'config/constant';
import { FormattedNumber } from 'react-intl';
import { InlineOfferBadge } from 'components/offer-badge/offer-badge';
import { OFFER_TYPE } from 'config/constant';
import dynamic from 'next/dynamic';
import { ProductFlags } from 'components/product-flags';
import { getImageSrc } from 'utils/general-helper';
import WeightOptionList from 'components/weight-option-list';
import Tooltip from 'components/tooltip/tooltip';
import { getPriceInStore } from '../../../../share/order.helper';
import { CustomerContext } from 'contexts/customer/customer.context';

const AddItemToCart = dynamic(
  () => import('components/add-item-to-cart'), {
  ssr: false
});

const StyledCard = styled.div(
  css({
    width: '100%',
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderRadius: 6,
    border: '1px solid #f3f3f3',
    display: 'flex',
    flexDirection: 'column',
    transition: '0.3s ease-in-out',
    position: 'relative',
    cursor: 'pointer',

    ':hover': {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
      transform: 'translateY(-5px)',
      color: 'primary.hover',
    },
  })
);

const StyledImageWrapper = styled.div({
  height: 290,
  width: '100%',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexGrow: 1,
  overflow: 'hidden',

  // TODO: Need improve cause we must use !important to add padding for image
  // https://github.com/vercel/next.js/discussions/18312
  img: {
    padding: '10px !important',
  },

  '@media screen and (max-width: 1280px)': {
    height: 250,
  },

  '@media screen and (max-width: 560px)': {
    height: 180,
  },
});

const StyledTitle = styled.h2({
  marginBottom: 10,
  fontSize: 16,
  fontWeight: 'bold',
});
const StyledInfo = styled.div(
  css({
    marginBottom: 10,
    color: 'text.label',
    fontSize: 14,
    fontWeight: 'normal',
    overflow: 'auto',
  }));
const StyledPriceWrapper = styled.div({
  alignItems: 'center',
  marginTop: 15,
  marginBottom: 15,
  '@media screen and (min-width: 991px)': {
    display: 'flex',
  }
});

const StyledPrice = styled.span(
  css({
    color: 'text.bold',
    fontSize: 18,
    fontWeight: 'semiBold',
    lineHeight: 1,
  })
);

const SalePrice = styled.span(
  css({
    color: 'text.regular',
    fontSize: 15,
    lineHeight: 1,
    fontWeight: 'regular',
    padding: '0 5px',
    overflow: 'hidden',
    position: 'relative',
    marginLeft: 10,
    display: 'inline-block',
    alignItems: 'center',

    ':before': {
      content: '""',
      width: '100%',
      height: 1,
      display: 'inline-block',
      backgroundColor: 'text.regular',
      position: 'absolute',
      top: '50%',
      left: 0,
    },
  })
);

interface Props {
  handleAddFavoriteProduct?: any;
  handleRemoveFavoriteProduct?: any;
  data: any;
  disableClickOnInlineOfferBadge?: boolean;
}

export const ProductCard = ({ data, disableClickOnInlineOfferBadge = false }: Props) => {
  console.info('render', 'ProductCard: p' + data._id);
  let { _id, name, image, unit, price, weight, slug, offer, total_bought, weight_list } = data;
  const [priceOption, setPriceOption] = useState(price);
  const [weightOption, setWeightOption] = useState(weight);
  const [tooltip, setTooltip] = useState(false);
  const { customerState } = useContext<any>(CustomerContext);
  const priceInStore = getPriceInStore(customerState, data);

  useEffect(() => {
    let price = 0;
    if (customerState) {
      if (weight != 0) {
        price = priceInStore * (weightOption / weight);
      } else {
        price = priceInStore;
      }
    } else {
      if (weight != 0) {
        price = price * (weightOption / weight);
      } else {
        price = price;
      }
    }
    setPriceOption(price);
  }, [weightOption, customerState]);

  function disableGoToProductDetail(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const showTooltip = () => {
    setTooltip(true);
  }

  return (
    <Link href="/product/[slug]" as={`/product/${_id}-${slug}`}>
      <a className="display-flex">
        <StyledCard className="product-card"> {/*class product-card is used to make animation for AddItemToCart*/}
          <ProductFlags className='card-item' data={data} offer={offer} />
          <StyledImageWrapper>
            <Image
              src={getImageSrc(image)}
              //class product-image is used to make animation for AddItemToCart
              className="product-image"
              alt={name}
            />
          </StyledImageWrapper>
          <Box px={20} pb={20}>
            <StyledTitle>{name}</StyledTitle>
            <StyledInfo><span style={{ float: 'left' }}>{unit} - {weight} {WEIGHT}</span><span style={{ float: 'right' }}>{total_bought} solgt</span></StyledInfo>
            {offer ? <InlineOfferBadge offer={offer} data={data} disableClickOnInlineOfferBadge={disableClickOnInlineOfferBadge} /> : null}
            <StyledPriceWrapper>
              <StyledPrice>{CURRENCY} <FormattedNumber value={offer && ![OFFER_TYPE.QUANTITY, OFFER_TYPE.COMBO].includes(offer.type) && priceOption > offer.sale_price ? offer.sale_price : priceOption} currency={CURRENCY} /></StyledPrice>
              {offer && ![OFFER_TYPE.QUANTITY, OFFER_TYPE.COMBO].includes(offer.type) && priceInStore > offer.sale_price ? <SalePrice>Før {CURRENCY} <FormattedNumber value={priceInStore} /></SalePrice> : null}
            </StyledPriceWrapper>
            {weight_list?.length && (
              <Tooltip open={tooltip} placemnet title='vælg vægt' placement='bottom'>
                <StyledInfo>
                  <WeightOptionList weight_list={weight_list} weight_option={weightOption} onSelect={(weight_option) => {
                    setWeightOption(weight_option);
                    setTooltip(false);
                  }} />
                </StyledInfo>
              </Tooltip>
            )}
            <StyledInfo><FormattedNumber value={price * 1000 / weight} style="currency" currency={CURRENCY} />{PER_KG} </StyledInfo>
            <AddItemToCart data={data} weightOption={weight_list?.includes(weightOption) ? weightOption : null} variant="full" buttonText="Add" showTooltip={showTooltip} />
          </Box>
        </StyledCard>
      </a>
    </Link>
  );
};
