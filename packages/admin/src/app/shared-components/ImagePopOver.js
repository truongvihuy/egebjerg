import { Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { getImageSrc } from 'app/constants';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 1000,
    fontSize: theme.typography.pxToRem(18),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

const ImagePopOver = ({ src, size = 60, ignoreCache = false }) => {
  if (src) {
    return (
      <HtmlTooltip title={<img src={getImageSrc(src, 300, ignoreCache)} style={{ maxWidth: 300, maxHeight: 300, objectFit: 'scale-down' }} />} placement="right">
        <div>
          <LazyLoadImage
            src={getImageSrc(src, size, ignoreCache)} // use normal <img> attributes as props
            style={{ width: size, height: size, objectFit: 'contain' }}
            effect="blur"
          />
        </div>
      </HtmlTooltip>
    );
  } else {
    return (
      <div>
        <LazyLoadImage src="/assets/images/logos/egebjerg-gray.svg" style={{ width: size*2/3, height: size*2/3, objectFit: 'contain' }} effect="blur" />
      </div>
    );
  }
};
export default ImagePopOver;
