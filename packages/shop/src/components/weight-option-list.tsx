import { WEIGHT } from 'config/constant';
import { FormattedNumber } from 'react-intl';
import styled, { css } from 'styled-components';

const StyledOption = styled.button<any>(
  (props) => css({
    border: `1px solid ${props.active ? '#009E7F' : 'white'}`,
    marginRight: '2px',
    padding: 4,
    borderRadius: '4px'
  })
);

const WeightOptionList = (props) => {
  return (
    <>
      {props.weight_list.map((value, index) => (
        <StyledOption key={index} active={props.weight_option === value} onClick={(e) => {
          e.preventDefault();
          props.onSelect(value);
        }}>
          <FormattedNumber value={value} /> {WEIGHT}
        </StyledOption>
      ))}
    </>
  );
};

export default WeightOptionList;