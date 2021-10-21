import styled from 'styled-components';
import systemCss from '@styled-system/css';
import { themeGet } from '@styled-system/theme-get';

export const DesktopView = styled.div`
  display: none;
  width: 100%;

  @media only screen and (min-width: 990px) {
    display: flex;
  }
`;

export const MobileView = styled.div`
  display: none;
  @media only screen and (max-width: 989px) {
    width: 100%;
    display: flex;
  }
`;

export const OrderBox = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;

  @media only screen and (max-width: 1199px) {
    padding: 0 20px;
  }
`;

export const OrderListWrapper = styled.div`
  width: 330px;
  height: auto;
  display: flex;
  flex-direction: column;
  border: 1px solid ${themeGet('colors.gray.500', '#f1f1f1')};
  flex-shrink: 0;
  margin-right: 30px;
  overflow: hidden;
  background-color: #fff;

  @media only screen and (max-width: 1199px) {
    width: 310px;
    margin-right: 20px;
  }
`;

export const StyledOrderContainer = styled.div`
  width: 100%;
  padding: 0 20px 20px;

  @media (max-width: 767px) {
    padding: 0;
  }

  .rc-collapse {
    background-color: transparent;
    border-radius: 0;
    border: 0;

    > .rc-collapse-item {
      margin-bottom: 15px;
      background-color: ${themeGet('colors.gray.200', '#f7f7f7')};
      border-radius: ${themeGet('radii.base', '6px')};
      overflow: hidden;
      margin-bottom: 15px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      flex-shrink: 0;
      border: 1px solid transparent;

      &.rc-collapse-item-active {
        background-color: ${themeGet('colors.white', '#ffffff')};
        border: 1px solid ${themeGet('colors.gray.500', '#f1f1f1')};
      }

      > .rc-collapse-header {
        padding: 0;
        outline: 0;
      }

      .rc-collapse-content {
        padding: 0px;
        > .rc-collapse-content-box {
          box-sizing: border-box;
          padding: 0px;
          margin: 0;
        }
      }
    }
  }
`;

export const OrderDetailsWrapper = styled.div`
  width: 100%;
  min-height: calc(100vh - 190px);
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border: 1px solid ${themeGet('colors.gray.500', '#f1f1f1')};
`;

export const Title = styled.h3`
  font-family: ${themeGet('fonts.heading', 'sans-serif')};
  font-size: ${themeGet('fontSizes.lg', '21')}px;
  font-weight: ${themeGet('fontWeights.semiBold', '600')};
  color: ${themeGet('colors.text.bold', '#0D1136')};
  margin: 20px 0;
`;

// Invoice Table design
export const ImageWrapper = styled.span`
  width: 75px;
  height: 75px;
  display: flex;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 15px;
  overflow: hidden;
`;

export const ItemName = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.base', '15')}px;
  font-weight: ${themeGet('fontWeights.bold', '700')};
  color: ${themeGet('colors.text.bold', '#0D1136')};
  margin-bottom: 5px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: normal;
`;
export const ItemSize = styled('span')`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.sm', '13')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.text.regular', '#77798c')};
  margin-bottom: 5px;
`;
export const ItemPrice = styled('span')`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.sm', '13')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.primary.regular', '#009e7f')};
`;

export const TotalPrice = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.base', '15')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.text.bold', '#0D1136')};
`;

export const StyledOfferBadge = styled.span`
  margin-top: 15px;
  span {
    padding: 2px 15px;
    background-color: #eda32f;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
  }
`;

export const NoOrderFound = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.base', '15')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.text.regular', '#77798c')};
  padding: 50px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledButtonText = styled.span`
  display: none;
  margin-left: 8px;

  @media only screen and (min-width: 1630px) {
    display: block;
  }
`;

export const StyledButtonWrapper = styled.div`
  display: flex;
  margin-bottom: 15px;

  button:not(:last-child) {
    margin-right: 20px;
  }
  button {
    flex: auto;
  }
`