import React from 'react';
import styled from 'styled-components';
import css from '@styled-system/css';
const RadioGroupWrapper = styled.div<any>(
  (props) =>
    css({
      display: 'flex',
      flexWrap: props.flexWrap ? 'wrap' : 'unset',
    })
);
type RadioGroupProps = {
  containerClassName?: string;
  itemList: any[];
  component?: (item: object, index?: number) => React.ReactNode;
  secondaryComponent?: React.ReactNode;
  flexWrap?: boolean
};

const RadioGroup: React.FC<RadioGroupProps> = ({
  itemList = [],
  component,
  containerClassName,
  secondaryComponent,
  flexWrap = true
}) => {
  if (!Array.isArray(itemList)) {
    return null;
  }

  return (
    <RadioGroupWrapper flexWrap={flexWrap} className={`radioGroup ${containerClassName}`.trim()}>
      {itemList.map(
        (item: any, index: any) => component && component(item, index)
      )}

      {secondaryComponent && secondaryComponent}
    </RadioGroupWrapper>
  );
};

export default RadioGroup;
