import styled from 'styled-components';
import { variant } from 'styled-system';

export const StyledTooltip = styled.div({
  position: 'relative',
});

export const StyledTooltipText = styled.div<any>(
  (props) => ({
    visibility: props.open ? 'visible' : 'hidden',
    width: '120px',
    textAlign: 'center',
    borderRadius: '6px',
    backgroundColor: 'black',
    color: '#fff',
    padding: '4px',
    zIndex: 1,
    position: 'absolute',

    ':after': {
      content: '""',
      position: 'absolute',
      borderWidth: '5px',
      borderStyle: 'solid',
    },
  }),
  variant({
    prop: 'placement',
    variants: {
      left: {
        top: '-5px',
        right: 'calc(100% + 5px)',
        ':after': {
          top: '50%',
          marginTop: '-5px',
          left: '100%',
          borderColor: 'transparent transparent transparent black',
        }
      },
      right: {
        top: '-5px',
        left: 'calc(100% + 5px)',
        ':after': {
          top: '50%',
          marginTop: '-5px',
          right: '100%',
          borderColor: 'transparent black transparent transparent',
        }
      },
      top: {
        bottom: '100%',
        left: 'calc(50% - 60px)',
        ':after': {
          top: '100%',
          left: '50%',
          borderColor: 'black transparent transparent transparent',
        }
      },
      bottom: {
        top: '100%',
        left: 'calc(50% - 60px)',
        ':after': {
          bottom: '100%',
          left: '50%',
          borderColor: 'transparent transparent black transparent',
        }
      }
    }
  })
);