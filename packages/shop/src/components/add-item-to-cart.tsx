import React, { useContext } from 'react';
import styled from 'styled-components';
import { CartIcon } from 'assets/icons/CartIcon';
import css from '@styled-system/css';
import { useCart } from 'contexts/cart/use-cart';
import { Counter } from './counter/counter';
import { variant as _variant } from 'styled-system';
import { Box } from './box';
import { cartAnimation } from 'utils/cart-animation';
import { FormattedMessage } from 'react-intl';
import { CustomerContext } from 'contexts/customer/customer.context';

const StyledIcon = styled.span<any>(
  _variant({
    variants: {
      full: {
        px: 3,
        height: 36,
        backgroundColor: '#e6e6e6',
        display: 'flex',
        transition: '0.35s ease-in-out',
        alignItems: 'center',
      },
      itemDetail: {
        px: 3,
        height: 36,
        backgroundColor: '#e6e6e6',
        display: 'flex',
        transition: '0.35s ease-in-out',
        alignItems: 'center',
      },
    },
  })
);
const StyledButton = styled.button<any>(
  css({
    width: 36,
    height: 36,
    borderRadius: 6,
    transition: '0.35s ease-in-out',
    backgroundColor: '#fff',
    border: '1px solid',
    borderColor: '#e6e6e6',
    cursor: 'pointer',
    ':hover:not(:disabled)': {
      backgroundColor: 'primary.regular',
      borderColor: 'primary.regular',
      color: '#fff',
    },
    ':disabled': {
      cursor: 'not-allowed',
    }
  }),
  _variant({
    variants: {
      full: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f3f3f3',
        padding: 0,
        border: 'none',
        overflow: 'hidden',
        ':hover:not(:disabled)': {
          backgroundColor: 'primary.hover',
          borderColor: 'primary.hover',
          color: '#fff',
          [StyledIcon]: {
            backgroundColor: 'primary.regular',
            color: '#fff',
          },
        },
      },
      itemDetail: {
        width: 'auto',
        height: '48px',
        px: 30,
        fontSize: ['base'],
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'primary.regular',
        border: 0,
        color: 'white',
        textDecoration: 'none',
        fontFamily: 'inherit',
        ':hover:not(:disabled)': {
          backgroundColor: 'primary.hover',
          borderColor: 'primary.hover',
          color: '#fff',
        },
        ':disabled': {
          color: 'text.light',
          bg: 'gray.500',
        },
        [StyledIcon]: {
          display: 'none',
          backgroundColor: 'primary.regular',
          color: '#fff',
        },
      }
    },
  })
);

interface Props {
  data: any;
  variant?: string;
  buttonText?: string;
  weightOption?: number;
  showTooltip?: () => void;
}

export const AddItemToCart = ({ data, variant, buttonText, weightOption, showTooltip }: Props) => {
  const { customerState } = useContext<any>(CustomerContext);
  console.info('render', 'AddItemToCart: p' + data._id + ' | customerState.isNormalAuthenticated = ' + customerState.isNormalAuthenticated);

  const { addItem, removeItem, getItem, isInCart } = useCart();
  const itemIsInCart = isInCart(data._id, data.weight_list?.length ? weightOption : null);
  const itemInCart = getItem(data._id, data.weight_list?.length ? weightOption : null);

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (data.weight_list?.length && !data.weight_list.includes(weightOption)) {
      showTooltip();
    } else {
      addItem({...data, weight_option: weightOption});
      if (!itemIsInCart) {
        cartAnimation(e);
      }
    }
  };
  const handleRemoveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (data.weight_list?.length && !data.weight_list.includes(weightOption)) {
      showTooltip();
    } else {
      removeItem({...data, weight_option: weightOption});
    }
  };

  return !itemIsInCart ? (
    <StyledButton
      disabled={!customerState.isNormalAuthenticated || data.status < 1}
      aria-label="add item to cart"
      onClick={handleAddClick}
      variant={variant}
    >
      {variant === 'itemDetail' ? <CartIcon mr={2} /> : null}
      {!!buttonText && <Box flexGrow={1}>{<FormattedMessage id={customerState.isNormalAuthenticated ? 'addToCartButton' : 'logInToAddToCartButton'} defaultMessage={buttonText} />}</Box>}
      <StyledIcon variant={variant}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 10 10"
        >
          <path
            data-name="Path 9"
            d="M143.407,137.783h-1.25v4.375h-4.375v1.25h4.375v4.375h1.25v-4.375h4.375v-1.25h-4.375Z"
            transform="translate(-137.782 -137.783)"
            fill="currentColor"
          />
        </svg>
      </StyledIcon>
    </StyledButton>
  ) : (
    <Counter
      disabled={!customerState.isNormalAuthenticated || data.status < 1}
      value={itemInCart?.quantity}
      onDecrement={handleRemoveClick}
      onIncrement={handleAddClick}
      className="card-counter"
      variant={variant || 'altHorizontal'}
    />
  );
};

export default AddItemToCart;
