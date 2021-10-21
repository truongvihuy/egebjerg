import React from 'react';
import { Input } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { getImageSrc } from 'app/constants';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const ImageNewspaper = (props) => {
  const { newspaper } = props;
  const [pageValue, setPageValue] = React.useState(props.page + 1);

  React.useEffect(() => {
    setPageValue(props.page + 1);
  }, [props.page])

  const onChange = (e) => {
    const page = +e.target.value - 1;
    if (page === -1) {
      setPageValue('');
    }
    if (-1 < page && page < newspaper?.total_page) {
      props.onChangePage(page);
      setPageValue(page + 1);
    }
  };

  const onChangePage = (step) => {
    const page = props.page + step;
    if (-1 < page && page < newspaper?.total_page) {
      props.onChangePage(page);
      setPageValue(page + 1);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <IconButton type='button' onClick={() => onChangePage(-1)} color='primary'>
        <Icon>arrow_back_ios</Icon>
      </IconButton>
      <span style={{ width: '10%', paddingRight: '10%' }}>Page</span>
      <Input type='number' style={{ width: '30px', textAlignLast: 'center' }} value={pageValue} onChange={onChange} />
      <span style={{ width: '10%', paddingRight: '10%', paddingLeft: '10px' }}> / {newspaper?.total_page}</span>
      <IconButton type='button' onClick={() => onChangePage(1)} color='primary'>
        <Icon>arrow_forward_ios</Icon>
      </IconButton>
      <TransformWrapper>
        <TransformComponent>
          <img key={`${newspaper?._id}-${props.page}`} src={getImageSrc(newspaper?.offer_list?.img_list?.[props.page]?.uid ?? null, '0')} />
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
};

export default ImageNewspaper;