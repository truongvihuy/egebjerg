import styled from 'styled-components';
import css from '@styled-system/css';
export const StyledLogoBox = styled.a(
  css({
    color: 'text.bold',
    fontSize: 26,
    fontWeight: 'bold',
    cursor: 'pointer',
    mr: [0, 20, 40],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  })
);

export const StyledLogoImage = styled.img({
  display: 'block',
  backfaceVisibility: 'hidden',
  '&.desktop': {
    maxHeight: 70,
  },
  '&.mobile': {
    maxHeight: 50,
  }
});
