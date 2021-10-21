import styled from "styled-components";
import { themeGet } from '@styled-system/theme-get';

export const StyledOrderDetailsWrapper = styled.div`
  margin: 0 100px;
  width: 100%;
  min-height: calc(100vh - 190px);
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border: 1px solid ${themeGet('colors.gray.500', '#f1f1f1')};

  @media only screen and (max-width: 990px) {
    margin: 0px;
  }
`;