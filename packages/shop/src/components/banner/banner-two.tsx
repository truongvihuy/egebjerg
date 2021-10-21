import React, { useState } from 'react';
import SwiperCore, { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { SliderNav } from './banner.style';
import { ArrowNext } from 'assets/icons/ArrowNext';
import { ArrowPrev } from 'assets/icons/ArrowPrev';
import styled from 'styled-components';

interface Props {
  display?: boolean;
  data: any[] | undefined;
}

SwiperCore.use([Navigation]);

const ImageWrapper = styled.div({
  position: 'relative',

  img: {
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
  },

  '@media (max-width: 575px)': {
    minHeight: 180,

    img: {
      height: 180,
      objectPosition: 'left',
      objectFit: 'cover',
    },
  },
});

export const Banner: React.FC<Props> = ({
  data,
  display,
  ...props
}) => {
  const [isShowed, setIsShowed] = useState(display);
  if (display !== isShowed) {
    setIsShowed(display);
  };
  return (
    isShowed ? (
      <Swiper
        id="banner"
        loop={true}
        slidesPerView={1}
        navigation={{
          nextEl: '.banner-slider-next',
          prevEl: '.banner-slider-prev',
        }}
        style={{ marginBottom: 25, minHeight: 180 }}
      >
        {data.map((item, idx) => (
          <SwiperSlide key={idx}>
            <ImageWrapper>
              <img src={item.img} alt={item.alt} />
            </ImageWrapper>
          </SwiperSlide>
        ))}
        <SliderNav className="banner-slider-next">
          <ArrowNext />
        </SliderNav>
        <SliderNav className="banner-slider-prev">
          <ArrowPrev />
        </SliderNav>
      </Swiper>
    ) : null
  );
};
