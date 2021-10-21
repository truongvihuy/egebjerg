import React from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { OFFER_TYPE_CONFIG, OFFER_TYPE, CURRENCY } from 'config/constant';
import styled, { css } from 'styled-components';
import { Information as InformationIcon } from 'assets/icons/Information';
import { openModal, closeModal } from '@redq/reuse-modal';
import ModalOffer from 'components/offer-badge/modal-offer';

type OfferType = {
    type?: any;
};

const StyledCircle = styled.div<OfferType>`
    display: flex;
    flex-wrap: wrap;
    border: solid 1px ${props => OFFER_TYPE_CONFIG[props.type].color};

    height: 4rem;
    width: 4rem;
    font-size: 12px;
    background-color: ${props => OFFER_TYPE_CONFIG[props.type].color};
    border-radius: 50%;
    
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;

    text-transform: uppercase;
    font-weight: 700;
`;

const StyledInnerTop = styled.div<OfferType>`
    align-self: ${props => OFFER_TYPE_CONFIG[props.type].displayType ? 'flex-end' : 'center'};
    ${props => OFFER_TYPE_CONFIG[props.type].displayType
        ? `top: ${props.type === OFFER_TYPE.LIMIT_COMBO ? '4px' : '-4px'};` : ''}
    color: #fff;
    position: relative;

    :before {
        content: '';
        top: 0;
        bottom: 50%;
        position: absolute;
        right: 0;
        left: 0;
    }

    span {
        position: relative;
        display: block;
    }
`;

const StyledInnerBottom = styled.div<OfferType>`
    text-align: center;
    color: ${props => OFFER_TYPE_CONFIG[props.type].color};

    :before {
        content: "";
        top: 50%;
        bottom: 0;
        position: absolute;
        right: 0;
        left: 0;
        background-color: #fff;
    }

    span {
        top: ${props => props.type === OFFER_TYPE.LIMIT_COMBO ? '2px' : '-4px'};
        font-size: .6rem;
        position: relative;
        display: block;
        width: 55px;
    }
`;
interface Props {
    offer: any
}

const StyledOfferDiv = styled.div`
`;

const StyledOffer = styled.span<any>((props) => css({
    padding: '2px 8px',
    backgroundColor: OFFER_TYPE_CONFIG[props.type].color,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'normal',
    cursor: 'pointer',
}));

export const onClickComboOfferBadge = (offer) => {
    openModal({
        show: true,
        config: {
            className: 'combo-offer',
            width: 'auto',
            height: 'auto',
            enableResizing: false,
            disableDragging: true,
        },
        closeOnClickOutside: true,
        component: ModalOffer,
        closeComponent: '',
        componentProps: { offer, onCloseBtnClick: closeModal },
    });
}

export const InlineOfferBadge = ({ offer, data, className = '', disableClickOnInlineOfferBadge = false }) => {
    return offer.type === OFFER_TYPE.QUANTITY
        ? <StyledOffer type={offer.type} className={className}>{offer.quantity} stk. for {CURRENCY} <FormattedNumber value={offer.sale_price} /></StyledOffer>
        : offer.type === OFFER_TYPE.LIMIT
            ? <StyledOffer type={offer.type} className={className}>MAX KØB til tilbudspris {offer.quantity} stk.</StyledOffer>
            : offer.type === OFFER_TYPE.COMBO || offer.type === OFFER_TYPE.LIMIT_COMBO
                ? <StyledOfferDiv className='has-svg-icon' onClick={disableClickOnInlineOfferBadge ? null : (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClickComboOfferBadge(offer)
                }}>
                    <StyledOffer type={offer.type} className={className}>
                        {
                            offer.type === OFFER_TYPE.LIMIT_COMBO
                                ? `MAX KØB til tilbudspris ${offer.quantity} stk.`
                                : <>Mix {offer.quantity} stk. for {CURRENCY} <FormattedNumber value={offer.sale_price} /></>
                        }
                    </StyledOffer>
                    <InformationIcon color={OFFER_TYPE_CONFIG[offer.type].color} className='can-click'></InformationIcon>
                </StyledOfferDiv>
                : <StyledOffer type={offer.type} className={className}>SPAR <FormattedNumber value={data.price - offer.sale_price} /></StyledOffer>
}

export const CircleOfferBadge: React.FC<Props> = ({ offer }) => {
    return (
        <StyledCircle type={offer.type}>
            <StyledInnerTop type={offer.type}>
                <span><FormattedMessage id='offer' defaultMessage='Offer' /></span>
            </StyledInnerTop>
            {OFFER_TYPE_CONFIG[offer.type].displayType ? (
                <StyledInnerBottom type={offer.type}>
                    <span>{OFFER_TYPE_CONFIG[offer.type].name}</span>
                </StyledInnerBottom>
            ) : null}
        </StyledCircle>
    )
}