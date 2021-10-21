import Select from 'react-select';
import styled from 'styled-components';
import css from '@styled-system/css';
import { themeGet } from '@styled-system/theme-get';

const StyledSortingLabel = styled.div<any>(
  css({
    fontWeight: 'normal',
    color: 'text.label',
    marginRight: '5px',
    '@media (max-width: 580px)': {
      flexBasis: '100%',
    }
  }),
);

const StyledSelectWrapper = styled.div`
  display: inline-flex;
  z-index: 2;
  height: 25px;
  margin: auto 0;
  
  @media (max-width: 1024px) {
    margin-top: 15px;
  }
  
  @media (min-width: 992px) {
    width: 200px;
  }

  @media (max-width: 991px) {
    flex-grow: 1;
  }

  /* React Select -- Inline Modifier
  * Inline container with margin to space between inline content 
  */
  .react-select--inline {
    display: inline-block;
    margin: 0 0.25em;
    .react-select__option {
      padding: 5px 0 5px 20px;
      font-weight: initial;
      color: #000;
    }
    .react-select__option:hover {
      background-color: transparent;
      color : ${themeGet('colors.primary.regular', 'red')}
    }
    .react-select__option--is-selected {
      font-weight: bold;
      background-color: transparent;
      // color : ${themeGet('colors.primary.regular', 'red')}
    }
    .react-select__option--is-focused {
      background-color: transparent;
      // color : ${themeGet('colors.primary.regular', 'red')}
    }
  }

  /* Remove border, outline, box-shadow, and min-height values */
  .react-select--inline .react-select__control {
    border: none;
    outline: none;
    box-shadow: none;
    height: 22px;
    cursor: pointer;
  }

  .react-select--inline .react-select__menu {
    width: 150px;
    padding: 10px 0px;
  }

  /* Tighten up spacing */
  .react-select--inline .react-select__value-container {
    padding: 0;
  }

  /* Position value relative (instead of absolute) and remove transform and max-width */
  .react-select--inline .react-select__single-value {
    font-weight: bold;
    position: relative;
    transform: none;
    max-width: none;
  }

  /* CSS triangle dropdown indicator next to selected value */
  .react-select--inline .react-select__single-value::after {
    content: " ";
    position: relative;
    display: inline-block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 5px 4px 0 4px;
    border-color: #000000 transparent transparent transparent;
    margin-left: 0.25em;
    top: -0.125em;
  }
`

const Sorting = (props) => {
  let optionList = {
    'standard': { value: 'standard', label: 'Standard' },
    'best-seller': { value: 'best-seller', label: 'Bedst sælgende' },
    'newest': { value: 'newest', label: 'Nyeste' },
    'low-price': { value: 'low-price', label: 'Pris lav til høj' },
    'high-price': { value: 'high-price', label: 'Pris høj til lav' },
  };
  return (
    <StyledSelectWrapper>
      <StyledSortingLabel>Sortering:</StyledSortingLabel>
      <Select
        classNamePrefix="react-select"
        className="react-select--inline"
        theme={{
          spacing: {
            menuGutter: 0,
            baseUnit: 0
          },
          borderRadius: 0
        }}
        components={{
          IndicatorsContainer: () => null
        }}
        isSearchable={false}
        closeMenuOnSelect={true}
        defaultValue={optionList[props.sort]}
        maxMenuHeight={200}
        onChange={props.onChange}
        value={optionList[props.sort]}
        options={Object.values(optionList)}
      />
      {props.children}
    </StyledSelectWrapper>
  );
}

export default Sorting;