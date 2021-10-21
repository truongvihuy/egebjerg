import styled from 'styled-components';
import css from '@styled-system/css';
import { variant } from 'styled-system';

export const StyledGrid = styled.div<any>(
  css({
    display: 'grid',
    gridGap: '10px',
  }),
  variant({
    variants: {
      categorySidebar: {
        gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',

        '@media screen and (min-width: 630px)': {
          gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))',
        },

        '@media screen and (min-width: 768px)': {
          gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))',
        },

        '@media screen and (min-width: 991px)': {
          gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))',
        },

        '@media screen and (min-width: 1200px)': {
          gridTemplateColumns: 'repeat(4, minmax(180px, 1fr))',
        },

        '@media screen and (min-width: 1700px)': {
          gridTemplateColumns: 'repeat(5, minmax(240px, 1fr))',
        },

        '@media screen and (min-width: 1900px)': {
          gridTemplateColumns: 'repeat(6, minmax(240px, 1fr))',
        },
      },
      fullWidth: {
        gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',
        '@media screen and (min-width: 630px)': {
          gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))',
        },

        '@media screen and (min-width: 768px)': {
          gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))',
        },

        '@media screen and (min-width: 991px)': {
          gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))',
        },

        '@media screen and (min-width: 1200px)': {
          gridTemplateColumns: 'repeat(5, minmax(220px, 1fr))',
        },

        '@media screen and (min-width: 1700px)': {
          gridTemplateColumns: 'repeat(6, minmax(240px, 1fr))',
        },

        '@media screen and (min-width: 1900px)': {
          gridTemplateColumns: 'repeat(7, minmax(255px, 1fr))',
        },
      },
      newspaper: {
        margin: '0, auto',
        gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',
        '@media screen and (min-width: 630px)': {
          gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',
        },

        '@media screen and (min-width: 768px)': {
          gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',
        },

        '@media screen and (min-width: 991px)': {
          gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
        },

        '@media screen and (min-width: 1200px)': {
          gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))',
        },

        '@media screen and (min-width: 1700px)': {
          gridTemplateColumns: 'repeat(4, minmax(270px, 1fr))',
        },

        '@media screen and (min-width: 1900px)': {
          gridTemplateColumns: 'repeat(4, minmax(255px, 1fr))',
        },

        '@media screen and (min-width: 2000px)': {
          gridTemplateColumns: 'repeat(4, minmax(255px, 1fr))',
        },
      }
    },
  })
);