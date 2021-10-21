import styled from 'styled-components';
import css from '@styled-system/css';
import { shadow } from 'styled-system';
export const StyledForm = styled.form<any>(
  (props) =>
    css({
      display: 'flex',
      alignItems: 'center',
      borderRadius: 'base',
      overflow: 'initial',
      width: props.minimal ? '100%' : 700,
      color: 'text.regular',
      backgroundColor: props.minimal ? 'gray.200' : 'white',
      borderWidth: props.minimal ? '1px' : '0',
      borderStyle: 'solid',
      borderColor: props.minimal ? `gray.500` : 'white',
      position: 'relative',

      input: {
        pl: props.minimal ? 0 : 20,
      },
    }),
  shadow
);

export const StyledInput = styled.input(
  css({
    flexGrow: 1,
    fontSize: 'base',
    pr: 20,
    height: 48,
    color: 'text.regular',
    backgroundColor: 'inherit',
    appearance: 'none',
  }),
  {
    border: 0,
    '&:focus': {
      outline: 0,
    },

    '&::-webkit-input-placeholder, &::-moz-placeholder, &::-moz-placeholder, &::-ms-input-placeholder': {
      fontSize: 'base',
      color: 'text.regular',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
  }
);

export const StyledCategoryName = styled.span(
  css({
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: '38px',
    px: 15,
    color: 'primary.regular',
    backgroundColor: 'gray.200',
    borderRadius: 'base',
  }),
  {
    margin: '5px',
    whiteSpace: 'nowrap',
    textTransform: 'capitalize',
  }
);

export const StyledSearchButton = styled.button(
  css({
    backgroundColor: 'primary.regular',
    color: 'white',
    fontSize: 'base',
    fontWeight: 'bold',
  }),
  {
    display: 'flex',
    height: 48,
    alignItems: 'center',
    border: 0,
    outline: 0,
    paddingLeft: 30,
    paddingRight: 30,
    cursor: 'pointer',
    flexShrink: 0,
  }
);

export const StyledSuggestionBox = styled.div(
  css({
    backgroundColor: 'white',
    fontSize: 'base',
  }),
  {
    zIndex: 3,
    width: '100%',
    marginTop: '10px',
    position: 'absolute',
    top: '100%',
    maxHeight: '60vh',
    overflowY: 'auto',
    boxShadow: '0 0 0 1px hsl(0deg 0% 0% / 10%), 0 4px 11px hsl(0deg 0% 0% / 10%)',
    '.product + .keyword, .keyword + .product': {
      borderTop: 'solid 1px #ccc'
    }
  }
);

export const StyledSuggestionItem = styled.div(
  css({
    padding: '10px 20px',
    display: 'flex',
    '&.selected': {
      bg: '#1ba8ff1a',
      color: 'primary.hover',
      fontSize: 'base',
    },
    '&:hover': {
      bg: '#1ba8ff1a',
      color: 'primary.hover',
    },
  })
);

export const StyledImageWrapper = styled.span({
  width: 40,
  height: 40,
  display: 'flex',
  cursor: 'pointer',
  flexShrink: 0,
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  }
});

export const StyledText = styled.span({
  display: 'block',
  flexDirection: 'column',
  marginLeft: '15px',
  alignSelf: 'center',
  overflow: 'hidden',
  cursor: 'pointer',
});

export const StyledClearButton = styled.button({
  cursor: 'pointer',
  padding: '5px 20px',
  border: 0,
  height: '48px',
  backgroundColor: 'initial'
});