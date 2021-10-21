import styled from 'styled-components';
import css from '@styled-system/css';

import { themeGet } from '@styled-system/theme-get';
import { Row as Rows, Col as Cols } from 'react-styled-flexboxgrid';

export const SettingsForm = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const HeadingSection = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
`;

export const Title = styled.h3`
  font-family: ${themeGet('fonts.heading', 'sans-serif')};
  font-size: ${themeGet('fontSizes.lg', '21')}px;
  font-weight: ${themeGet('fontWeights.semiBold', '600')};
  color: ${themeGet('colors.text.bold', '#0D1136')};
`;

export const SettingsFormContent = styled.div<any>((props) =>
  css({
    marginLeft: props.subContent ? '15px' : 0,
    marginBottom: '50px',
    '&:last-child': {
      'marginBottom': 0,
    },
    h3: {
      margin: props.subContent ? '15px 0' : '10px 0',
    }
  })
);

export const Row = styled(Rows)`
  margin-bottom: 40px;

  @media only screen and (min-width: 0em) and (max-width: 47.99em) {
    margin-bottom: 30px;
  }
`;

export const Col = styled(Cols)`
  @media only screen and (min-width: 0em) and (max-width: 47.99em) {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const StyledInputWrapper = styled.div`
  position: relative;

  input {
    border: 1px solid ${themeGet('colors.primary.regular', '#009E7F')};
  }

  &:hover {
    .button-wrapper {
      opacity: 1;
      visibility: visible;
    }
  }
`;