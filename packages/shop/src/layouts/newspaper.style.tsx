import styled from 'styled-components';
import css from '@styled-system/css';

export const StyledNav = styled.div(
  css({
    display: 'flex',
    justifyContent: 'space-around',
    alignContent: 'center',
    width: '100vw',
    zIndex: 10,
    padding: '10px 10px',
    position: 'fixed',
    bg: '#fff',
    '& + img': {
      marginTop: '50px',
    },
    
    '@media screen and (min-width: 50em)': {
      position: 'initial',
      width: '100%',
      bg: 'initial',
      
      '& + img': {
        marginTop: '0px',
      },
    }
  })
);
export const StyledNavButton = styled.button<any>(
  css({
    width: '15%',
    height: 36,
    borderRadius: 6,
    transition: '0.35s ease-in-out',
    backgroundColor: '#fff',
    border: '1px solid',
    borderColor: '#e6e6e6',
    cursor: 'pointer',
    ':hover:enabled': {
      backgroundColor: 'primary.regular',
      borderColor: 'primary.regular',
      color: '#fff',
    },
  })
);
export const StyledInputWrapper = styled.div<any>(
  css({
    width: '70%',
    textAlign: 'center',
  })
);
export const StyledInput = styled.input<any>(
  css({
    height: 36,
    textAlign: 'center',
    width: '30%',
    borderRadius: 6,
    transition: '0.35s ease-in-out',
    backgroundColor: '#fff',
    border: '1px solid',
    borderColor: '#e6e6e6',
    outlineColor: 'primary.regular'
  })
);