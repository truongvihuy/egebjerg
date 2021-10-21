import React, { useState, useRef, useEffect } from 'react';
import { Counter } from 'components/counter/counter';
import { CloseIcon } from 'assets/icons/CloseIcon';
import { CURRENCY, WEIGHT } from 'config/constant';
import { FormattedNumber } from 'react-intl';
import {
  ItemBox,
  Image,
  Information,
  StyledName,
  Price,
  Weight,
  Total,
  StyledRemoveButton,
  StyledInputNote,
  StyledInputWrapper,
  StyledIcon,
  StyledNoteError,
} from './cart-item.style';
import { InlineOfferBadge } from 'components/offer-badge/offer-badge';
import { Comment } from 'assets/icons/Comment';
import Link from 'next/link';
import Select from 'react-select';
import { useCart } from 'contexts/cart/use-cart';
import { getImageSrc } from 'utils/general-helper';

interface Props {
  data: any;
  onDecrement: (e: Event) => void;
  onIncrement: (e: Event) => void;
  onRemove: (e: Event) => void;
  handleWriteNote?: (e) => void;
  changeWeightOption?: (next, pre) => void;
  style?: any;
}

export const CartItem: React.FC<Props> = ({
  data,
  onDecrement,
  onIncrement,
  onRemove,
  handleWriteNote,
  changeWeightOption,
  style,
}) => {
  const { _id, name, image, weight, weight_option, price, quantity, total, offer, group, note, slug, associated_item_id } = data;
  const { items } = useCart();
  const [displayComment, setDisplayComment] = useState(!!note);
  const [noteState, setNoteState] = useState(note);
  const [error, setError] = useState('');
  const refInput = useRef();
  const onClickShowComment = () => {
    setDisplayComment(!displayComment);
  }

  const cartItem = items.find(e => e.cart._id === _id);
  const weight_list = cartItem?.product.weight_list?.map(e => ({
    value: e,
    label: <><FormattedNumber value={e} /> {WEIGHT}</>
  }));
  const weightOption = weight_list?.find(e => e.value === weight_option);

  useEffect(() => {
    let input: any = refInput.current;
    if (input) {
      input.focus();
      const length = input.value.length;
      input.setSelectionRange(length, length);
    }
  }, [displayComment]);
  useEffect(() => {
    if (!displayComment && note) {
      setDisplayComment(true);
    }
    setNoteState(note);
  }, [note]);

  const checkWriteNote = (e) => {
    if (e.target.value.length <= 256) {
      setError('');
    } else {
      setError(`Maksimalt 256 tegn: ${e.target.value.length} tegn`);
    }
    setNoteState(e.target.value);
  }

  const checkBlurNote = (e) => {
    if (e.target.value.length <= 256 && note !== e.target.value) {
      handleWriteNote(e);
    }
  }

  const onChangeOption = (option) => {
    if (option.value !== weight_option) {
      changeWeightOption({
        ...data,
      }, {
        ...data,
        weight_option: option.value
      });
    }
  }

  return (
    <ItemBox style={style} className={`${group ? `group-${group}` : ''} ${associated_item_id ? 'associated-item' : ''}`}>
      {!associated_item_id && _id ? (
        <Counter
          disabled={data.error}
          value={quantity}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
          variant="lightVertical"
        />
      ) : <div style={{ width: 30 }} />}
      <div style={{ width: '100%' }}>
        <StyledName>{_id ? <Link href="/product/[slug]" as={`/product/${_id}-${slug}`}><a>{name}</a></Link> : name}</StyledName>
        <div style={{ display: 'flex' }}>
          <Image src={getImageSrc(image)} />
          <Information style={{ marginLeft: '10px' }}>
            <Price>
              {CURRENCY} <FormattedNumber value={price} currency={CURRENCY} />
            </Price>
            <Weight>
              {quantity} {weight ? <> x <FormattedNumber value={weight} />{WEIGHT}</> : null}
            </Weight>
          </Information>
          <Information style={{ marginLeft: 'auto' }}>
            {data.error ? (
              <Total style={{ color: 'red' }}>Udsolgt</Total>
            ) : (
              <Total>{CURRENCY} <FormattedNumber value={total} currency={CURRENCY} /></Total>
            )}
            {!associated_item_id && !displayComment && (
              <StyledIcon onClick={onClickShowComment} style={{ cursor: 'pointer' }}><Comment /></StyledIcon>
            )}
          </Information>
          {!associated_item_id && _id ? (
            <StyledRemoveButton onClick={onRemove}>
              <CloseIcon />
            </StyledRemoveButton>
          ) : <div style={{ width: 35 }} />}
        </div>
        {weight_list && (
          <StyledInputWrapper>
            <Select value={weightOption} options={weight_list} onChange={onChangeOption} isClearable={false} isSearchable={false} />
            {/* <FormattedNumber value={weight_option} />{WEIGHT} */}
          </StyledInputWrapper>
        )}
        {offer ? <InlineOfferBadge className='badge-offer' offer={offer} data={data} /> : null}
        {displayComment && (
          <StyledInputWrapper>
            <StyledInputNote ref={refInput}
              value={noteState ?? ''} onChange={checkWriteNote} onBlur={checkBlurNote} />
            {error && <StyledNoteError>{error}</StyledNoteError>}
          </StyledInputWrapper>
        )}
      </div>
    </ItemBox>
  );
};
