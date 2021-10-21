import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

const StyledCheckoutWrapper = styled.div`
  width: 100%;
  display: flex;
  padding: 130px 60px 60px;
  position: relative;

  @media (max-width: 1100px) {
    padding-left: 0;
    padding-right: 0;
  }

  @media (max-width: 990px) {
    padding-top: 60px;
  }
`;

export const StyledCheckoutContainer = styled.div`
  width: 100%;
  display: flex;
  counter-reset: section-counter;

  @media (min-width: 990px) {
    width: 970px;
    margin-left: auto;
    margin-right: auto;
  }

  @media (min-width: 1200px) {
    width: 1175px;
    margin-left: auto;
    margin-right: auto;
  }

  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

export const StyledCheckoutInformation = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-right: 20px;
  padding: 20px;

  @media (max-width: 990px) {
    margin-right: 10px;
  }

  @media (max-width: 767px) {
    order: 1;
    margin-right: 0;
  }
`;

export const StyledHeading = styled.h3`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.lg', '21')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.text.bold', '#0D1136')};
  line-height: 1.4;
  margin-bottom: 35px;
  position: relative;
  width: calc(100% - 100px);
  display: flex;
  align-items: center;

  @media (max-width: 600px) {
    font-size: ${themeGet('fontSizes.md', '19')}px;
  }
`;

export const StyledInformationBox = styled.div`
  background-color: ${themeGet('colors.white', '#ffffff')};
  padding: 30px;
  padding-bottom: 20px;
  position: relative;
  margin-bottom: 20px;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.08);

  @media (max-width: 767px) {
    padding: 20px;
  }
`;

export const StyledTotalProduct = styled.div`
  flex-grow: 1;
  text-align: right;
  padding-right: 60px;
`;

export const StyledTotalPrice = styled.div`
  flex-grow: 1;
  text-align: left;
  padding-left: 60px;
`;

export const StyledDeliverySchedule = styled.div`
  .radioGroup {
    justify-content: space-between;
    > label {
      margin-right: 0;
      flex: calc(33.3333333333% - 10px);
      max-width: calc(33.3333333333% - 10px);
      padding: 11px 15px;

      @media (max-width: 900px) and (min-width: 768px) {
        flex: calc(50% - 10px);
        max-width: calc(50% - 10px);
      }

      @media (max-width: 480px) {
        flex: 100%;
        max-width: 100%;
        margin-right: 0;
      }
    }
  }
`;
export const StyledReplaceMentGoods = styled.div`
  .radioGroup {
    justify-content: space-between;
    > label {
      flex: calc(50% - 10px);
      max-width: calc(50% - 10px);

      @media (max-width: 900px) and (min-width: 768px) {
        flex: calc(50% - 10px);
        max-width: calc(50% - 10px);
      }

      @media (max-width: 480px) {
        flex: 100%;
        max-width: 100%;
        margin-right: 0;
      }
    }
  }
`;

export const StyledCheckoutSubmit = styled.div`
  margin-top: 25px;
  .reusecore__button {
    width: 100%;
  }
`;

export const StyledInfoText = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.base', '15')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.text.bold', '#0D1136')};
  margin-bottom: 15px;
  margin-top: 15px;
`;

export const StyledCouponBoxWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-top: 50px;

  .couponCodeText {
    margin-right: auto;
  }
`;

export const StyledCouponCode = styled.p`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: calc(${themeGet('fontSizes.base', '15')}px - 1px);
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.text.regular', '#77798c')};
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: baseline;

  span {
    font-weight: ${themeGet('fontWeights.bold', '700')};
    color: ${themeGet('colors.primary.regular', '#009e7f')};
    margin-left: 10px;
  }
`;

export const StyledRemoveCoupon = styled.button`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.xs', '12')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.secondary.regular', '#ff5b60')};
  width: auto;
  height: auto;
  display: inline-block;
  border: 0;
  outline: 0;
  box-shadow: none;
  background-color: transparent;
  padding: 0;
  cursor: pointer;
  margin-left: 5px;
`;

export const StyledCouponInputBox = styled.div`
  width: 100%;
  display: flex;
  align-items: center;

  @media (max-width: 600px) {
    .reusecore__button {
      padding-right: 30px !important;
      flex-shrink: 0;
    }
  }
`;

export const StyledHaveCoupon = styled.button`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.base', '15')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.primary.regular', '#009e7f')};
  width: auto;
  height: auto;
  display: inline-block;
  border: 0;
  outline: 0;
  box-shadow: none;
  background-color: transparent;
  padding: 0;
  cursor: pointer;
`;

export const StyledErrorMsg = styled('span')`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.xs', '12')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.secondary.hover', '#FF282F')};
  padding-top: 10px;
  display: flex;
  margin-left: 20px;
`;

export const StyledTermConditionText = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.smm', '13')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.text.regular', '#77798c')};
  line-height: 1.5;
  display: block;
`;

export const StyledTermConditionLink = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.smm', '13')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.secondary.regular', '#ff5b60')};
  margin-left: 5px;
  cursor: pointer;
  line-height: 1.5;
`;

export const StyledCartWrapper = styled.div`
  width: 350px;
  flex-shrink: 0;
  padding-top: 20px;

  @media (min-width: 768px) and (max-width: 1200px) {
    width: 260px;
  }

  @media (max-width: 767px) {
    order: 0;
    width: 100%;
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 20px;
    padding-bottom: 30px;
    position: relative !important;
  }

  .checkout-scrollbar {
    height: 100%;
    max-height: 390px;
    padding-right: 15px;
  }
`;

export const StyledOrderInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${themeGet('colors.white', '#ffffff')};
  padding: 10px 0px;

  @media (min-width: 768px) and (max-width: 990px) {
    padding-right: 15px;
  }
`;

export const StyledTitle = styled.h3`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.base', '15')}px;
  font-weight: ${themeGet('fontWeights.bold', '700')};
  color: ${themeGet('colors.text.bold', '#0D1136')};
  text-align: center;
  margin-bottom: 15px;
`;

export const StyledItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 15px;
`;

export const StyledCalculationWrapper = styled.div`
  border-top: 1px solid ${themeGet('colors.gray.700', '#e6e6e6')};
  padding: 20px 15px 0;
  margin-top: 20px;
`;

export const StyledItems = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 25px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const StyledQuantity = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: calc(${themeGet('fontSizes.base', '15')}px - 1px);
  font-weight: ${themeGet('fontWeights.bold', '700')};
  color: ${themeGet('colors.text.bold', '#0D1136')};
`;

export const StyledMultiplier = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: calc(${themeGet('fontSizes.base', '15')}px - 1px);
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.text.regular', '#77798c')};
  margin: 0 12px;
`;

export const StyledItemInfo = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: calc(${themeGet('fontSizes.base', '15')}px - 1px);
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.text.regular', '#77798c')};
  margin-right: 15px;
  width:100%;
`;

export const StyledPrice = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: calc(${themeGet('fontSizes.base', '15')}px - 1px);
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.text.regular', '#77798c')};
  margin-left: auto;
  width:70%;
`;

export const StyledTextWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 10px;
`;

export const StyledText = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: calc(${themeGet('fontSizes.base', '15')}px - 1px);
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.text.regular', '#77798c')};
`;
export const StyledTextError = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: calc(${themeGet('fontSizes.base', '15')}px - 1px);
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.secondary.regular', '#ff5b60')};
`;

export const StyledBold = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: calc(${themeGet('fontSizes.base', '15')}px - 1px);
  font-weight: ${themeGet('fontWeights.bold', '700')};
  color: ${themeGet('colors.text.bold', '#0D1136')};
`;

export const StyledSmall = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: 11px;
`;

export const StyledNoProductMsg = styled.h3`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: calc(${themeGet('fontSizes.base', '15')}px - 1px);
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.text.regular', '#77798c')};
  line-height: 1.2;
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  align-items: center;
`;

export const StyledNoProductImg = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  svg {
    width: 140px;
    height: auto;
  }
`;

export const StyledCoopMemberWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 50px;
  .couponCodeText {
    margin-right: auto;
  }
`;

export const StyledCoopMemberInputWrapper = styled.p`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: calc(${themeGet('fontSizes.base', '15')}px - 1px);
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.text.regular', '#77798c')};
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: baseline;

  span {
    font-weight: ${themeGet('fontWeights.bold', '700')};
    color: ${themeGet('colors.primary.regular', '#009e7f')};
    margin-left: 10px;
  }
`;

export const StyledRemoveCoopMember = styled.button`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.xs', '12')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.secondary.regular', '#ff5b60')};
  width: auto;
  height: auto;
  display: inline-block;
  border: 0;
  outline: 0;
  box-shadow: none;
  background-color: transparent;
  padding: 0;
  cursor: pointer;
  margin-left: 5px;
`;

export const StyledCoopMemberInputBox = styled.div`
  width: 100%;
  display: flex;
  align-items: center;

  @media (max-width: 600px) {
    .reusecore__button {
      padding-right: 30px !important;
      flex-shrink: 0;
    }
  }
`;

export const StyledIsCoopMember = styled.button`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.base', '15')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.primary.regular', '#009e7f')};
  width: auto;
  height: auto;
  display: inline-block;
  border: 0;
  outline: 0;
  box-shadow: none;
  background-color: transparent;
  padding: 0;
  cursor: pointer;
`;

export const StyledMessageError = styled.span`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.smm', '13')}px;
  font-weight: ${themeGet('fontWeights.regular', '400')};
  color: ${themeGet('colors.secondary.regular', '#ff5b60')};
`;
export default StyledCheckoutWrapper;
