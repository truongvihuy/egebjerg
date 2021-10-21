import styled from 'styled-components';
import css from '@styled-system/css';
export const ItemBox = styled.div(
  css({
    fontSize: 'base',
    fontWeight: 'bold',
    py: 10,
    px: 25,
    borderBottom: `1px solid`,
    borderBottomColor: 'gray.200',

    '&.associated-item': {
      fontSize: 'sm',
      pt: 0,
      // fontWeight: 'regular',
    }
  }),
  {
    display: 'flex',
    alignItems: 'center',
    '&.group-start': {
      borderTop: `1px solid #ccc`,
      borderLeft: `1px solid #ccc`,
      borderRight: `1px solid #ccc`,
      borderRadius: '10px 10px 0px 0px',
    },
    '&.group-mid': {
      borderLeft: `1px solid #ccc`,
      borderRight: `1px solid #ccc`,
    },
    '&.group-end': {
      borderBottom: `1px solid #ccc`,
      borderLeft: `1px solid #ccc`,
      borderRight: `1px solid #ccc`,
      borderRadius: '0px 0px 10px 10px',
      marginBottom: '4px',
    },
    '&.group-one': {
      border: `1px solid #ccc`,
      borderRadius: '10px',
      marginBottom: '4px',
    },
    '.badge-offer': {
      marginLeft: '15px',
      marginTop: '5px',
      display: 'inline-block',
    },
  }
);
export const Information = styled.div({
  display: 'flex',
  flexDirection: 'column',
});
export const Image = styled.img({
  width: 60,
  height: 60,
  objectFit: 'contain',
  margin: '0 15px',

  '.associated-item &': {
    width: 50,
    height: 50,
  }
});
export const StyledName = styled.div(
  css({
    fontWeight: 'md',
    color: 'text.bold',
    mb: '0px',
    lineHeight: 1.5,
    padding: '0 0 5px 15px',
    cursor: 'pointer',
  }),
);
export const Price = styled.span(
  css({
    color: 'primary.regular',
    mt: '8px',
    mb: '8px',
  })
);
export const Weight = styled.span(
  css({
    fontSize: 'sm',
    fontWeight: 'regular',
    color: 'text.regular',
    mb: '5px',
  })
);
export const Total = styled.span(
  css({
    color: 'text.bold',
    ml: 'auto',
    mt: '8px',
    mb: '8px',
  })
);

export const StyledRemoveButton = styled.button<any>({
  padding: '5px',
  border: 0,
  outline: 0,
  marginLeft: '15px',
  cursor: 'pointer',
  color: 'rgba(0, 0, 0, 0.25)',
  transition: 'all 0.4s ease',
  backgroundColor: 'transparent',
  display: 'inline-flex',
  marginTop: '12px',
  height: '20px',

  '&:hover': {
    color: 'red',
  },
});


export const StyledInputNote = styled.textarea<any>(
  css({
    width: '100%',
    borderColor: '#F7F7F7',
    outline: 'none',
    bg: '#F7F7F7',
    resize: 'none',
    display: 'flex',
    flexDirection: 'column',

    '&:focus': {
      borderColor: 'primary.regular'
    }
  })
);

export const StyledIcon = styled.span(
  css({
    '&:hover path': {
      fill: 'primary.regular',
    }
  })
);

export const StyledNoteError = styled.span(
  css({
    color: 'red',
    fontSize: 'sm',
    fontWeight: 'body',
  })
);

export const StyledInputWrapper = styled.div({
  position: 'relative',
  marginBottom: 5,
  padding: '5px',
  marginLeft: 10,
});