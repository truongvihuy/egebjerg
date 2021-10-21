import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

export const MobileCarouselDropdown = styled.div`
  @media (min-width: 990px) {
    display: none;
  }
`;

export const OfferPageWrapper = styled.div`
  width: 100%;
  height: auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${themeGet('colors.gray.200', '#f7f7f7')};
  position: relative;
  // padding: 100px 60px 60px;
  padding-top:100px;
  justify-content: space-between;

  // @media (max-width: 768px) {
  //   padding: 100px 30px 60px;
  // }

  // @media (max-width: 1199px) {
  //   padding: 100px 30px 60px;
  // }
`;

export const HeaderSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  min-height: 400px;
  background-color: ${themeGet('colors.gray.300', '#f4f4f4')};
`;

export const MainContentArea = styled.main`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  background-color: ${themeGet('colors.gray.200', '#f7f7f7')};
  padding-right: 0;
  transition: padding-right 0.35s ease-in-out;

  @media (max-width: 990px) {
    background-color: ${themeGet('colors.white', '#ffffff')};
  }
`;

export const SidebarSection = styled.div`
  background-color: ${themeGet('colors.white', '#ffffff')};
  width: 280px;

  @media (max-width: 990px) {
    display: none;
  }
`;

export const ContentSection = styled.div`
  width: calc(100% - 280px);
  height: auto;
  min-height: 100vh;
  padding: 30px 30px 50px;

  @media (max-width: 1199px) and (min-width: 991px) {
    padding: 15px 30px 50px;
  }

  @media (max-width: 1367px) and (min-width: 1200px) {
    padding: 15px 30px 50px;
  }

  @media (max-width: 990px) {
    width: 100%;
    padding: 0px 0px 100px;
  }

  @media (max-width: 768px) {
    min-height: auto;
  }

  .offer-slider {
    padding: 0 0 30px 30px;
  }
`;

export const OfferSection = styled.div`
  width: 100%;
  display: block;
  padding: 60px;
  background-color: ${themeGet('colors.white', '#ffffff')};
  position: relative;
  border-bottom: 1px solid ${themeGet('colors.gray.500', '#f1f1f1')};

  @media (max-width: 1199px) and (min-width: 991px) {
    padding: 20px 15px;
    .prevButton {
      left: 0;
    }

    .nextButton {
      right: 0;
    }
  }
  @media (max-width: 990px) {
    padding: 15px;
    border-bottom: 0;

    .prevButton {
      left: 5px;
    }

    .nextButton {
      right: 5px;
    }
  }
`;

export const Heading = styled.h2`
  font-size: ${themeGet('fontSizes.xl', '24')}px;
  font-weight: ${themeGet('fontWeights.bold', '700')};
  color: ${themeGet('colors.primary.regular', '#009e7f')};
  padding: 0px 20px 20px;
  margin: 50px 10px 20px;
  border-bottom: 2px solid ${themeGet('colors.primary.regular', '#009e7f')};
  width: auto;
  display: inline-block;
`;

export const ProductsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  background-color: ${themeGet('colors.gray.200', '#f7f7f7')};
  width:100%;
  @media (max-width: 768px) {
    width:100%;
    margin-left: -7.5px;
    margin-right: -7.5px;
    margin-top: 15px;
  }
`;
export const StyledContainerRow = styled.div`
  width: 100%;
  // margin-top: 15px;

  /* For not mobile phones: */
  @media all and (min-width: 50em) { 
    display: flex;
    flex-wrap: wrap;
    background-color: ${themeGet('colors.gray.200', '#f7f7f7')};
    width:100%;
  }

  .two-cols-container__1st-col {
    flex: initial;
  }
  .two-cols-container__2nd-col {
    flex: auto;
  }
`;

export const StyledContainerCol = styled.div`
  width: 100%;

  /* Desktops and laptops: 1024px ~ */  
  @media screen and (min-width: 1023px) {
    width: 500px;
    height: 85vh;
    overflow: auto;
  }

  @media screen and (min-width: 1224px) {
    width: 615px;
    padding-left: 1rem;
    padding-right: 1rem;
    margin-bottom: 2rem;
  }

  /* Sceen 2K, 4k */  
  @media screen and (min-width: 1900px) {
    width: 40%;
    padding-left: 1rem;
    padding-right: 1rem;
    margin-bottom: 2rem;
  }
  
`;
export const ProductsCol = styled.div`
  flex: 0 0 33.3333333%;
  max-width: 33.333333%;
  padding-left: 15px;
  padding-right: 15px;
  margin-bottom: 30px;

  @media (max-width: 1650px) {
    flex: 0 0 33.3333333%;
    max-width: 33.3333333%;
  }
  @media (max-width: 1300px) {
    flex: 0 0 33.3333333%;
    max-width: 33.3333333%;
  }
  @media (max-width: 1199px) and (min-width: 900px) {
    padding-left: 10px;
    padding-right: 10px;
    margin-bottom: 20px;
  }
  @media (max-width: 899px) and (min-width: 769px) {
    flex: 0 0 50%;
    max-width: 50%;
  }
  @media (max-width: 768px) {
    flex: 0 0 50%;
    max-width: 50%;
  }

  @media (max-width: 490px) {
    flex: 0 0 100%;
    max-width: 100%;
  }
`;

export const StyledHeading = styled.h3`
  font-size: 21px;
  font-weight: 700;
  color: #0d1136;
  line-height: 1.2;
  margin-bottom: 25px;
  width: 100%;
  text-align: center;
`;

export const StyledPageWrapper = styled.div`
  background-color: ${themeGet('backgroundGray', '#f7f7f7')};
  position: relative;
  min-height: 100vh;
  padding: 60px 20px 0px 20px;
  display: flex;
  flex-direction: column;

  @media (min-width: 989px) {
    padding: 100px 60px 60px 60px;
  }
`;

export const StyledPageContainer = styled.div`
  background-color: transparent;
  padding: 0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  @media (min-width: 990px) {
    width: 870px;
    margin-left: auto;
    margin-right: auto;
  }

  @media (max-width: 989px) {
    padding: 30px;
  }
`;

export const StyledFormWrapper = styled.div`
  background-color: ${themeGet('colors.gray.200', '#f7f7f7')};
  position: relative;
  padding: 130px 0 60px 0;

  @media (max-width: 990px) {
    padding: 0;
    padding-top: 60px;
  }
`;



export const StyledContainer = styled.div`
  background-color: ${themeGet('colors.white', '#ffffff')};
  border: 1px solid ${themeGet('colors.gray.500', '#f1f1f1')};
  padding: 60px;
  border-radius: ${themeGet('radii.base', '6px')};
  overflow: hidden;
  position: relative;
  @media (min-width: 990px) {
    width: 870px;
    margin-left: auto;
    margin-right: auto;
  }

  @media (max-width: 480px) {
    padding: 30px;
  }
`;

export const StyledFormTitleWrapper = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 50px;
`;

export const StyledFormTitle = styled.h3`
  font-family: ${themeGet('fonts.body', 'Lato')};
  font-size: ${themeGet('fontSizes.lg', '21')}px;
  font-weight: ${themeGet('fontWeights.bold', '700')};
  color: ${themeGet('colors.primary.regular', '#009e7f')};
  line-height: 1.2;
  margin: 0px;
`;

export const StyledFormLargeText = styled.p`
  font-size: ${themeGet('fontSizes.md', '19')}px;
  margin: 0px;
`;
