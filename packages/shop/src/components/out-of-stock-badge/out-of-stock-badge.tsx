import React from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import styled, { css } from 'styled-components';
type propType = {
    card?: any;
};
const StyledCircle = styled.div`
    display: flex;
    flex-wrap: wrap;
    border: solid 1px #BFC4E6;

    height: 4rem;
    width: 4rem;
    font-size: 12px;
    background-color: #BFC4E6;
    border-radius: 50%;
    
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;

    text-transform: uppercase;
    font-weight: 700;
`;
export const CircleOutOfStockBadge: React.FC<propType> = ({ card }) => {
    return (
        <StyledCircle>
            <span><FormattedMessage id='outOfStock' defaultMessage='Out of stock' /></span>
        </StyledCircle>
    )
}