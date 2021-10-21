import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';
export const RightMenuBox = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  .menu-icon {
    min-width: 14px;
    margin-right: 7px;
  }

  .menu-item {
    a, button {
      font-family: ${themeGet('fonts.body', 'Lato')};
      font-size: ${themeGet('fontSizes.base', '15')}px;
      font-weight: ${themeGet('fontWeights.bold', '700')};
      color: ${themeGet('colors.text.bold', '#0D1136')};
      line-height: 1.2em;
      display: block;
      transition: 0.15s ease-in-out;
      display: flex;
      align-items: center;
      margin-right: 45px;

      @media (max-width: 1400px) {
        margin-right: 35px;
        font-size: ${themeGet('fontSizes.base', '15')}px;
      }
      &:hover {
        color: ${themeGet('colors.primary.regular', '#009e7f')};
      }
      &.current-page {
        color: ${themeGet('colors.primary.regular', '#009e7f')};
      }
    }
  }

  .user-pages-dropdown {
    .popover-handler {
      height: 50px;
      display: float;
      overflow: hidden;
      // border-radius: 50%;
      img {
        position:relative;
        width: 50px;
        height: 50px;
        display: inline-block;
      }
    }

    .popover-content {
      .inner-wrap {
        /* padding: ; */
      }
    }
  }
`;
