import styled from 'styled-components';
import css from '@styled-system/css';
import Link from 'next/link';

const StyledBox = styled.div(
  css({
    fontFamily: 'body',
    fontWeight: 'regular',
    color: 'text.regular',
    px: 20,

    a: {
      color: 'primary.regular',
    },
  }),
  {
    marginTop: 50,
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
);
const Footer = () => {
  return (
    <StyledBox>
      <Link href='/contact'><a>Egebjerg Købmandsgård A/S</a></Link>
    </StyledBox>
  );
};
export default Footer;
