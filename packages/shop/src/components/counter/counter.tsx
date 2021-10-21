import React from 'react';
import { Plus, Minus } from 'assets/icons/PlusMinus';
import { CounterBox, CounterButton, CounterValue } from './counter.style';
interface Props {
  onDecrement: (e: Event) => void;
  onIncrement: (e: Event) => void;
  value: number;
  variant?: string;
  className?: string;
  disabled?: boolean;
}

export const Counter: React.FC<Props> = ({
  onDecrement,
  onIncrement,
  value,
  variant,
  className,
  disabled,
}) => {
  return (
    <CounterBox variant={variant} className={`${className} ${disabled ? 'disabled' : ''}`}>
      <CounterButton
        disabled={disabled}
        onClick={onDecrement}
        variant={variant}
        className='control-button minus-button'
      >
        <Minus />
      </CounterButton>
      <CounterValue onClick={onIncrement}>{value}</CounterValue>
      <CounterButton
        disabled={disabled}
        onClick={onIncrement}
        variant={variant}
        className='control-button plus-button'
      >
        <Plus />
      </CounterButton>
    </CounterBox>
  );
};
