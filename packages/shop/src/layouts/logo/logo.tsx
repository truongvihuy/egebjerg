import React from 'react';
import Router from 'next/router';
import { StyledLogoBox, StyledLogoImage } from './logo.style';
type LogoProps = {
  className?: string;
  imageUrl: string;
  alt: string;
  onClick?: () => void;
};

const Logo: React.FC<LogoProps> = ({ imageUrl, alt, onClick, className }) => {
  function onLogoClick() {
    Router.push('/');
    if (onClick) {
      onClick();
    }
  }
  return (
    <StyledLogoBox href='/' onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onLogoClick()
    }}>
      <StyledLogoImage className={className} src={imageUrl} alt={alt} />
    </StyledLogoBox>
  );
};

export default Logo;
