import React from 'react';
import styled from 'styled-components';
import css from '@styled-system/css';
import { Box } from './box';
import { Text } from './text';
import { useRouter } from 'next/router';
import { getImageSrc } from 'utils/general-helper';

const StyledCardBox = styled.a<any>((props) =>
  css({
    backgroundColor: ['gray.200', 'gray.200', '#fff'],
    textAlign: 'center',
    padding: '1rem 10px',
    borderRadius: [10, 10, 6],
    cursor: 'pointer',
    border: props.active ? '2px solid' : '2px solid',
    borderColor: props.active ? '#212121' : ['gray.200', 'gray.200', '#fff'],
    transition: '0.3s ease-in-out',
    ':hover': {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
      transform: 'translateY(-5px)',
    },
  })
);
interface Props {
  currentCategory: any;
  categoryMap: any;
  activeId: any;
  style?: any;
  onClick: (category: any) => void;
}
const Icon = ({ src, style }) => {
  return <img src={src} style={style} />
};
export const CardMenu = ({ currentCategory, categoryMap, onClick, activeId, style }: Props) => {
  const router = useRouter();
  const { pathname, query, asPath } = router;
  const regex = asPath.match(/(\?filter=.+?)&/);
  return (
    <>
      {(currentCategory?.children_direct ?? []).map((_id) => {
        let item = categoryMap[_id];

        return item && (
          <StyledCardBox
            key={_id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick(item)
            }}
            active={_id === activeId}
            role='button'
            style={style}
            href={`/category/${item._id}-${item.slug}${regex && regex[1] ? regex[1] : ''}`}
          >
            <Box
              padding='10px 15px'
              height={80}
              alignItems='center'
              justifyContent='center'
              display='flex'
            >
              <Icon src={getImageSrc(item.img)} style={{ height: 70, width: 'auto' }} />
            </Box>
            <Text as='span' fontSize={14} fontWeight={600}>
              {item.name}
            </Text>
          </StyledCardBox>
        )
      })}
    </>
  );
};
