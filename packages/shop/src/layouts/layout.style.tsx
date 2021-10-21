import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

export const LayoutWrapper = styled.div`
  background-color: ${themeGet('backgroundGray', '#F7F7F7')};
  min-height: 100vh;

  @media (max-width: 990px) {
    background-color: ${themeGet('backgroundGray', '#F7F7F7')};
  }

  .reuseModalHolder {
    padding: 0;
    overflow: auto;
    border-radius: ${themeGet('radii.small', '3px')}
      ${themeGet('radii.small', '3px')};
    border: 0;
  }
`;

export const StyledTransparentOverlay = styled.div`
  z-index: 1000;
  width: 100vw;
  height: 100vh;
  display: none;
  position: fixed;

  &.loading {
    display: block;
  }
`;
