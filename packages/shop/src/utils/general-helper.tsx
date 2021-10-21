import config from 'config/config';

export const getImageSrc = (imgSrc, size = 300, ignoreCache = false) => {
  if (!imgSrc) {
    return null;
  }
  const isSVG = imgSrc.indexOf('.svg') > -1;
  const isThumbor = !imgSrc.startsWith('http') && imgSrc.match(/^[a-fA-F0-9]{32}\/*/);
  let time = ignoreCache ? `?t=${Date.now()}` : '';
  if (isThumbor) {
    if (isSVG) {
      return `${config.THUMBOR_SERVER_URL}/image/${imgSrc}${time}`;
    } else {
      return `${config.THUMBOR_SERVER_URL}/images/${size}x0/${imgSrc}${time}`;
    }
  } else {
    return imgSrc;
  }
};