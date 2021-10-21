import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

export const StyledFieldWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 15px 0 15px 0;
  position: relative;
`;

export const StyledButton = styled.div`
  position: absolute;
  padding: 14px;
  right: 0px;
`;

export const StyledHeading = styled.div`
  font-family: ${themeGet('fontFamily.heading', 'sans-serif')};
  font-size: ${themeGet('fontSizes.md', '19')}px;
  font-weight: ${themeGet('fontWeights.bold', '700')};
  color: ${themeGet('colors.text.bold', '#0D1136')};
  margin-bottom: 15px;
`;