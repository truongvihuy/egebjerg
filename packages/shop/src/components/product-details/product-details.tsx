import React, { useContext, useEffect, useState } from 'react';
import {
  ProductDetailsWrapper,
  ProductPreview,
  ProductInfo,
  ProductTitlePriceWrapper,
  ProductTitle,
  ProductWeight,
  ProductDescription,
  ProductCartWrapper,
  ProductPriceWrapper,
  ProductPrice,
  SalePrice,
  ProductCartBtn,
  StyledRelatedItems,
} from './product-details.style';
import ReadMore from 'components/truncate/truncate';
import { CURRENCY, WEIGHT } from 'config/constant';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { useLocale } from 'contexts/language/language.provider';
import { ProductGrid } from 'components/product-grid/product-grid';
import { OFFER_TYPE } from 'config/constant';
import { CircleOfferBadge, InlineOfferBadge } from 'components/offer-badge/offer-badge';
import dynamic from 'next/dynamic';
import Breadcrumb from 'components/breadcrumb/breadcrumb';
import { getImageSrc } from 'utils/general-helper';
import WeightOptionList from 'components/weight-option-list';
import Tooltip from 'components/tooltip/tooltip';
import { getPriceInStore } from '../../../../share/order.helper';
import { CustomerContext } from 'contexts/customer/customer.context';
import { parseComponent } from 'utils/parse-component';

const ProductFlags = dynamic(() => import('components/product-flags'), {
  ssr: false,
});

const AddItemToCart = dynamic(
  () => import('components/add-item-to-cart'), {
  ssr: false
});

type ProductDetailsProps = {
  product: any;
  deviceType: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  customer?: any;
  fetchLimit?: number;
};

const ProductDetails: React.FunctionComponent<ProductDetailsProps> = ({
  product,
  deviceType,
}) => {
  if (!product) {
    return null;
  }

  console.info('render', 'ProductDetail', product);
  const [priceOption, setPriceOption] = useState(product.price);
  const [weightOption, setWeightOption] = useState(product.weight);
  const [tooltip, setTooltip] = useState(false);
  const { customerState } = useContext<any>(CustomerContext);

  useEffect(() => {
    let price = 0;
    if (customerState) {
      if (product.weight != 0) {
        price = weightOption * getPriceInStore(customerState, product) / (product.base_value ? product.base_value : product.weight);
      } else {
        price = getPriceInStore(customerState, product);
      }
    } else {
      if (product.weight != 0) {
        price = weightOption * product.price / (product.base_value ? product.base_value : product.weight);
      } else {
        price = product.price;
      }
    }
    setPriceOption(price);
  }, [weightOption, customerState]);

  const { isRtl } = useLocale();
  const offer = product.offer;
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 500);
  }, []);

  const showTooltip = () => {
    setTooltip(true);
  }

  let queryProduct: any = {};
  if (product.related_list) {
    queryProduct.product_id = product.related_list;
  } else {
    queryProduct.category_id = product.category_id;
  }

  return (
    <>
      <ProductDetailsWrapper className="product-card" dir="ltr">
        <Breadcrumb category_id={product.category_id} />
        <ProductPreview>
          <img
            src={getImageSrc(product.image)}
            alt={product.name}
            className="product-image"
          />
          {offer ? <div style={{ position: 'absolute', zIndex: 1, top: 55, right: 60 }}><CircleOfferBadge offer={offer} /></div> : null}
        </ProductPreview>

        <ProductInfo dir={isRtl ? 'rtl' : 'ltr'}>
          <ProductTitlePriceWrapper>
            <ProductTitle>{product.name}</ProductTitle>
          </ProductTitlePriceWrapper>

          <ProductWeight>{product.unit} - {product.weight} {WEIGHT}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{product.total_bought} solgt</ProductWeight>
          <ProductTitlePriceWrapper><ProductFlags data={product} /></ProductTitlePriceWrapper>
          {offer ? <ProductTitlePriceWrapper><InlineOfferBadge offer={offer} data={product} /></ProductTitlePriceWrapper> : null}

          {product.weight_list?.length && (
            <Tooltip open={true} placemnet title='vælg vægt' placement='left'>
              <WeightOptionList weight_list={product.weight_list} weight_option={weightOption} onSelect={(weight_option) => {
                setWeightOption(weight_option); setTooltip(false);
              }} />
            </Tooltip>
          )}
          <ProductPriceWrapper>
            <ProductPrice>
              {CURRENCY} <FormattedNumber value={offer && ![OFFER_TYPE.QUANTITY, OFFER_TYPE.COMBO].includes(offer.type) ? offer.sale_price : priceOption} />
            </ProductPrice>

            {offer && ![OFFER_TYPE.QUANTITY, OFFER_TYPE.COMBO].includes(offer.type) && (
              <SalePrice>
                Før {CURRENCY} <FormattedNumber value={priceOption} />
              </SalePrice>
            )}
          </ProductPriceWrapper>

          <ProductDescription>
            {parseComponent(product.description)}
            {/* <ReadMore character={600}>
              </ReadMore> */}
          </ProductDescription>

          <ProductCartWrapper>
            <ProductCartBtn>
              <AddItemToCart data={product} weightOption={product.weight_list?.includes(weightOption) ? weightOption : null} variant="itemDetail" buttonText="Add" showTooltip={showTooltip} />
            </ProductCartBtn>
          </ProductCartWrapper>

        </ProductInfo>

      </ProductDetailsWrapper>

      {offer?.product_id.length > 1 &&
        <StyledRelatedItems>
          {/* Can be combined with these items: */}
          <h2>Kan kombineres med disse varer</h2>
          <ProductGrid
            loadMore={false}
            query={{ product_id: offer.product_id.filter(_id => _id !== product._id) }}
            styledVariant='fullWidth'
          />
        </StyledRelatedItems>}

      <StyledRelatedItems>
        <h2>
          <FormattedMessage
            id="relatedItems"
            defaultMessage="Related Items"
          />
        </h2>

        <ProductGrid
          query={queryProduct}
          fetchLimit={5}
          styledVariant='fullWidth' />
      </StyledRelatedItems>
    </>
  );
};

export default ProductDetails;
