import { Banner } from 'components/banner/banner-two';
import { ProductGrid } from 'components/product-grid/product-grid';
import { Modal } from '@redq/reuse-modal';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import css from '@styled-system/css';
import { SidebarWithCardMenu } from 'layouts/sidebar/sidebar-with-card-menu';
import GroceryImgOne from 'assets/images/banner/grocery-banner-img-one.jpg';
import GroceryImgTwo from 'assets/images/banner/grocery-banner-img-two.jpg';
import { parseUrlParams, pushQueryToUrlParams } from 'utils/parse-url-params';
import { useContext } from 'react';
import { CustomerContext } from 'contexts/customer/customer.context';
import CardFilter from 'features/card-filter/card-filter';
import { SEO } from 'components/seo';


const CartPopUp = dynamic(() => import('features/carts/cart-popup'), {
  ssr: false,
});

const bannerSlides = [
  {
    img: GroceryImgOne,
    alt: 'Slide One',
  },
  {
    img: GroceryImgTwo,
    alt: 'Slide Two',
  },
];

export const getServerSideProps = async ({ params }) => {
  const _id = +params.slug.split('-')[0];
  if (isNaN(_id))
    return {
      notFound: true,
    };

  return {
    props: {
      categoryId: _id,
    },
  };
};

export default function CategoryPage({ categoryId, deviceType }) {
  console.info('render', categoryId ? 'Category: ' + categoryId : 'Index page');

  const router = useRouter();
  const { asPath, pathname } = router;
  let { query, hasUrlParamsValue } = parseUrlParams(asPath);
  const { customerState, customerDispatch } = useContext<any>(CustomerContext);

  if (typeof window !== 'undefined') {
    if (localStorage.getItem('isLogedIn') && !customerState._id) {
      return <Modal />;
    }
    // TODO: need call API to get favorite_list & most_bought_list from DB
    // if we depend on localStorage, that will not sync when user use multi devices but he not login/logout to update localStorage
    if (customerState) {
      if (!asPath.includes('filter') && !categoryId) {
        let productIdList = [];
        productIdList = productIdList.concat(customerState.favorite_list ?? []);
        productIdList = productIdList.concat(customerState.most_bought_list ?? []);

        if (productIdList.length > 0) {
          query['product_id'] = productIdList;
        }
      } else if (query?.is_favorite || query?.is_most_bought) {
        let productIdList = [];
        query.is_favorite && (productIdList = productIdList.concat(customerState.favorite_list ?? []));
        query.is_most_bought && (productIdList = productIdList.concat(customerState.most_bought_list ?? []));
        query['product_id'] = productIdList;
      }
    }
  }

  const onChangeFilter = (event) => {
    const tmpRouter = {
      pathname,
      params: pushQueryToUrlParams({
        ...query,
        [event.target.id]: event.target.checked,
      }),
    };
    router.push(tmpRouter.pathname, `${asPath.split('?')[0]}${tmpRouter.params ? `?${tmpRouter.params}` : ''}`);
  }

  const onChangeSort = (event) => {
    if (event.value == query.sort) {
      return;
    }
    const tmpRouter = {
      pathname,
      params: pushQueryToUrlParams({
        ...query,
        sort: event.value,
      }),
    };
    router.push(tmpRouter.pathname, `${asPath.split('?')[0]}${tmpRouter.params ? `?${tmpRouter.params}` : ''}`);
  }
  return (
    <Modal>
      <SEO title="" description="Home" />
      <ContentArea>
        <SidebarWithCardMenu query={query} categoryId={categoryId} deviceType={deviceType} />
        {!deviceType.desktop && (
          <CardFilter categoryId={categoryId} query={query} onChangeSort={onChangeSort} onChangeFilter={onChangeFilter} deviceType={deviceType} />
        )}
        <main>
          {deviceType.desktop && (
            <CardFilter categoryId={categoryId} query={query} onChangeSort={onChangeSort} onChangeFilter={onChangeFilter} deviceType={deviceType} />
          )}
          {deviceType.mobile === false && <Banner data={bannerSlides} display={!(hasUrlParamsValue || pathname !== '/')} />}
          <ProductGrid query={
            {
              ...query,
              category_id: categoryId ? [categoryId] : null
            }
          } styledVariant='categorySidebar' />
        </main>
      </ContentArea>
      <CartPopUp deviceType={deviceType} />
    </Modal >
  );
}

const ContentArea = styled.div<any>(
  css({
    overflow: 'hidden',
    padding: ['80px 0 100px', '68px 0 50px', '110px 2rem 50px'],
    display: 'grid',
    minHeight: '100vh',
    gridColumnGap: '30px',
    gridRowGap: ['15px', '20px', '0'],
    gridTemplateColumns: [
      'minmax(0, 1fr)',
      'minmax(0, 1fr)',
      '300px minmax(0, 1fr)',
    ],
    backgroundColor: '#f3f3f3',
  })
);
