import React from 'react';
import { StyledNameThumbnailWrapper, StyledNameThumbnail } from './name-thumbnail.style';

type Props = {
  name: string
};

const NameThumbnail: React.FC<Props> = ({ name }) => {
  let nameSplitList: any = name.replace(/\[|\]|\(|\)/, '');
  nameSplitList = nameSplitList.split(' ');
  let shortName = nameSplitList.length > 1
    ? nameSplitList[0][0].toUpperCase() + nameSplitList[nameSplitList.length - 1][0].toUpperCase()
    : nameSplitList[0][0].toUpperCase();

  return (
    <StyledNameThumbnailWrapper>
      <StyledNameThumbnail>{shortName}</StyledNameThumbnail>
    </StyledNameThumbnailWrapper>
  )
};

export default NameThumbnail;
