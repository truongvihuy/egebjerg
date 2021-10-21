import styled from 'styled-components';
export default function ErrorMessage({ message }) {
  return <StyledAside>{message}</StyledAside>;
}

const StyledAside = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'red',
  padding: '10px',
});
