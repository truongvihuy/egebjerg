import ContentLoader from 'react-content-loader';
import styled from 'styled-components';

export const OrderCardLoader = (props) => (
    <ContentLoader
      speed={2}
      width={288}
      height={161}
      backgroundColor='#f3f3f3'
      foregroundColor='#ecebeb'
      {...props}
    >
      <rect x='0' y='0' rx='0' ry='0' width='288' height='161' />
    </ContentLoader>
);

type OrderDetailLoaderProps = {
  column: string;
}

export const OrderDetailLoader: React.FC<OrderDetailLoaderProps> = ({ column }) => {
  switch (column) {
    case 'items': {
      return (
        <ContentLoader
          speed={2}
          width={621}
          height={75}
          backgroundColor='#f3f3f3'
          foregroundColor='#ecebeb'
        >
          <rect x='0' y='0' rx='0' ry='0' width='75' height='75' />
          <rect x='90' y='2' rx='0' ry='0' width='150' height='18' />
          <rect x='90' y='29' rx='0' ry='0' width='20' height='18' />
          <rect x='90' y='54' rx='0' ry='0' width='75' height='18' />
        </ContentLoader>
      );
    }
    case 'quantity': {
      return (
        <ContentLoader
          speed={2}
          width={22}
          height={22}
          backgroundColor='#f3f3f3'
          foregroundColor='#ecebeb'
        >
          <rect x='0' y='0' rx='0' ry='0' width='20' height='18' />
        </ContentLoader>
      );
    }
    case 'price': {
      return (
        <ContentLoader
          speed={2}
          width={77}
          height={22}
          backgroundColor='#f3f3f3'
          foregroundColor='#ecebeb'
        >
          <rect x='0' y='0' rx='0' ry='0' width='77' height='18' />
        </ContentLoader>
      );
    }
    // case 'button': {
    //   return null;
    // }
    default: return null;
  }
}