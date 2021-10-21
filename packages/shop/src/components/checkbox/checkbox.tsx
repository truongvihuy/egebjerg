import React, { useState } from 'react';
import {
  StyledCheckBox,
  StyledCheckBoxLabel,
  StyledCheckBoxLabelText,
  StyledCheckBoxInput,
  StyledCheckBoxSubInfo
} from './checkbox.style';

type CheckBoxProps = {
  id: string;
  disabled?: boolean;
  isChecked?: boolean;
  labelText: any;
  className?: string;
  labelPosition?: 'left' | 'right';
  [key: string]: unknown;
};

const CheckBox: React.FC<CheckBoxProps> = ({
  className,
  isChecked = false,
  labelText,
  id,
  labelPosition = 'right',
  disabled = false,
  subInfoText = undefined,
  ...props
}) => {
  // use toggle hooks
  const [checked, setChecked] = useState(isChecked);

  return (
    <StyledCheckBox className={`pickbazar__checkbox ${className ?? ''}`.trim()}>
      <StyledCheckBoxLabel htmlFor={id} position={labelPosition}>
        <StyledCheckBoxInput
          type="checkbox"
          className="checkbox-input"
          id={id}
          checked={checked}
          onChange={() => setChecked((prev) => !prev)}
          disabled={disabled}
          {...props}
        />
        {labelText && (
          <StyledCheckBoxLabelText position={labelPosition}>
            {labelText}
          </StyledCheckBoxLabelText>
        )}
        {subInfoText && (
          <StyledCheckBoxSubInfo>
            {subInfoText}
          </StyledCheckBoxSubInfo>
        )}
      </StyledCheckBoxLabel>
    </StyledCheckBox>
  );
};

export default CheckBox;
