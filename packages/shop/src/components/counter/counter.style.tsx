import styled from 'styled-components';
import css from '@styled-system/css';
import { variant } from 'styled-system';
export const CounterBox = styled.div<any>(
  css({
    display: 'flex',
    backgroundColor: 'primary.regular',
    color: 'white',
    fontSize: 'base',
    fontWeight: 'bold',
    '&.disabled': {
      cursor: 'not-allowed',
      backgroundColor: '#f3f3f3',
      color: 'rgba(16, 16, 16, 0.3)'
    },
    textAlign: 'center',
    cursor: 'pointer',
    '.minus-button': {
      backgroundColor: 'primary.regularLighter',
    },
    '.plus-button': {
      backgroundColor: 'transparent',
    }
  }),
  {
    borderRadius: 200,
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    '&:focus': {
      outline: 'none',
    },
  },
  variant({
    variants: {
      horizontal: {
        width: 104,
        height: 36,
      },
      vertical: {
        width: 30,
        height: 90,
        flexDirection: 'column-reverse',
      },
      lightHorizontal: {
        width: 104,
        height: 36,
        backgroundColor: 'gray.200',
        color: 'text.bold',
      },
      lightVertical: {
        width: 30,
        height: 90,
        flexDirection: 'column-reverse',
        backgroundColor: 'gray.500',
        color: 'text.bold',
        '.minus-button': {
          backgroundColor: 'gray.100',
        },
        '.plus-button': {
          backgroundColor: 'transparent',
        }
      },
      altHorizontal: {
        width: 104,
        height: 36,
        borderRadius: '6px',
      },
      altVertical: {
        width: 30,
        height: 90,
        borderRadius: '6px',
      },
      full: {
        width: '100%',
        height: 36,
        borderRadius: '6px',
      },
      itemDetail: {
        borderRadius: '6px',
      },
    },
  })
);

export const CounterButton = styled.button<any>(
  {
    border: 'none',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 10,
    cursor: 'pointer',
    '&:hover, &:focus': {
      outline: 'none',
    },
    ':disabled': {
      backgroundColor: '#e6e6e6',
      cursor: 'not-allowed'
    }
  },
  variant({
    variants: {
      lightHorizontal: {
        color: 'text.regular',
      },
      lightVertical: {
        color: 'text.regular',
      },
    },
  })
);

export const CounterValue = styled.div<any>({
  height: '100%',
  width: '100%',
  padding: '5px 0',
  display: 'flex',
  justifyContent: 'center',
  alignContent: 'center',
  flexDirection: 'column'
});
CounterValue.displayName = 'CounterValue';
CounterButton.displayName = 'CounterButton';
CounterBox.displayName = 'CounterBox';
CounterBox.defaultProps = {
  variant: 'horizontal',
};
