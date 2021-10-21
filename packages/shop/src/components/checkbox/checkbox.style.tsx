import styled from 'styled-components';
// import { themeGet } from '@styled-system/theme-get';
import css from '@styled-system/css';
export const StyledCheckBox = styled.div<any>(
  css({
    display: 'inline-flex',
    minWidth: '55px',
    margin: '0px 20px',
    '@media (max-width:580px)': {
      margin: '0px 3px',
      minWidth: '40px',

      '&:first-child': {
        marginLeft: 0,
      },
      '&:last-child': {
        marginRight: 0,
      },
    }
  }),
);
export const StyledCheckBoxInputIndicator = styled.div(
  css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 14,
    height: 14,
    borderRadius: 'base',
    borderWidth: 1,
    borderColor: 'text.regular',
    position: 'relative',
    transition: 'all 0.3s ease',
    '&::after': {
      content: ' ',
      width: 2,
      height: 6,
      transform: 'rotate(45deg) scale(0.8)',
      borderBottom: '2px solid',
      borderRight: '2px solid',
      borderColor: 'text.regular',
      position: 'absolute',
      top: 1,
      opacity: 0,
      visibility: 'hidden',
      transitionProperty: 'opacity, visibility',
      transitionDuration: '0.3s',
    },
  })
);
export const StyledCheckBoxInput = styled.input(
  css({
    margin: 0,
    overflow: 'hidden',
    pointerEvents: 'none',

    '&:checked + div': {
      borderColor: 'text.regular',
      backgroundColor: 'white',
      '&::after': {
        opacity: 1,
        visibility: 'visible',
        transform: 'rotate(45deg) scale(1)',
      },
    },
  })
);

export const StyledCheckBoxLabel = styled.label<any>(
  css({
    alignItems: 'center',
    color: 'text.label',
    fontSize: 'base',
    fontWeight: 'regular',
    cursor: 'pointer',
  }),
  ({ position }) => ({
    flexDirection: position === 'right' ? 'row-reverse' : 'row',
  })
);
export const StyledCheckBoxLabelText = styled.span<any>((props) =>
  props.position === 'left'
    ? {
      marginRight: 10,
    }
    : { marginLeft: 10 }
);
export const StyledCheckBoxSubInfo = styled.div<any>((props) =>
  css({
    fontWeight: 'regular',
    fontSize: 'sm'
  })
);
