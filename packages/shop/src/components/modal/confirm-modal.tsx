import styled from 'styled-components';
import { closeModal } from '@redq/reuse-modal';
import { Button } from 'components/button/button';
import { FormattedMessage } from 'react-intl';

const StyledButtonGroup = styled.div`
  display: flex;
  float: right;

  button {
    margin-left: 5px;
  }
`;

const StyledText = styled.div`
  margin-bottom: 15px;
`;

export const ConfirmModal = ({ onSubmit, text, type = 'delete', customSubmitText = null, customCancelText = null }) => {
  let submitEle: any = '';
  let cancelEle: any = '';
  switch (type) {
    case 'custom':
      submitEle = customSubmitText;
      cancelEle = customCancelText;
      break;
    case 'confirm':
      submitEle = 'Bekræft';//Confirm
      cancelEle = 'Annuller'; //Cancel
      break;
    case 'delete':
    default:
      submitEle = <FormattedMessage id='deleteBtn' defaultMessage='Delete' />;
      cancelEle = <FormattedMessage id='cancelBtn' defaultMessage='Cancel' />;
      break;
  }
  return <div>
    <StyledText>{text}</StyledText>
    <StyledButtonGroup>
      <Button onClick={closeModal} variant='text'>{ cancelEle }</Button>
      <Button onClick={onSubmit}>{ submitEle }</Button>
    </StyledButtonGroup>
  </div>
}