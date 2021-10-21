

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Information as InformationIcon } from 'assets/icons/Information';
import { openModal } from '@redq/reuse-modal';
import Switch from 'components/switch/switch';

const handleMoreInfo = (
  infoText
) => {
  openModal({
    show: true,
    config: {
      width: 360,
      height: 'auto',
      enableResizing: false,
      disableDragging: true,
    },
    closeOnClickOutside: true,
    component: MoreInfo,
    componentProps: { infoText },
  });
};

const MoreInfo = ({ infoText }) => {
  return (
    <div style={{ padding: '20px' }}>{infoText}</div>
  )
};

const YesNoOptions = ({ flag, handleChangeOption, infoText = null, titleId, style = null, title = null, switchSide = 'right' }) => {
  return (
    <div style={{ display: 'flex', margin: '10px 0', ...style }}>
      {switchSide == 'left' && <Switch style={{ margin: '2px 10px 0 10px' }} checked={flag} onUpdate={handleChangeOption} />}
      {title ? title : <FormattedMessage id={titleId} defaultMessage='Yes or no?' />}
      {infoText && <div onClick={() => handleMoreInfo(infoText)} style={{ margin: '2px 0 0 10px' }}>
        <InformationIcon color={'#009E7F'} />
      </div>}
      {switchSide == 'right' && <Switch style={{ margin: '2px 0 0 10px' }} checked={flag} onUpdate={handleChangeOption} />}
    </div>
  )
}
export default YesNoOptions;