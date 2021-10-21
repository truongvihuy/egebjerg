import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

export const StyledNameThumbnailWrapper = styled.div`
  height: 50px;
  width: 50px;
  padding: 5px;
  border-radius: 50%;
  &:hover {
    background-color: ${themeGet('colors.gray.700', '#E6E6E6')};
  }
`;

export const StyledNameThumbnail = styled.div`
  color: ${themeGet('colors.gray.300', '#f4f4f4')};
  font-weight: bold;
  background-color: ${themeGet('colors.primary.regular', '#009E7F')};
  border-radius: 50%;
  height: 100%;
  width: 100%;
  text-align: center;
  vertical-align: middle;
  line-height: 40px;   
`;

export default StyledNameThumbnailWrapper;
