import { gql } from '@apollo/client';

export const GET_PRODUCT_WITH_RELATED_PRODUCTS = gql`
  query getProductWithRelatedProducts($slug: String!, $type: String!) {
    product(slug: $slug) {
      _id
      name
      weight
      slug
      price
      type
      image
      category_id
    }
    relatedProducts(slug: $slug, type: $type) {
      _id
      name
      slug
      weight
      price
      type
      image
    }
  }
`;

export const GET_RELATED_PRODUCTS = gql`
  query getRelatedProducts($type: String!, $slug: String!) {
    relatedProducts(type: $type, slug: $slug) {
      _id
      name
      slug
      weight
      price
      type
      image
    }
  }
`;

export const GET_PRODUCTS = gql`
  query getProducts(
    $q: String,
    $category_id: [Int!],
    $offset: Int,
    $limit: Int,
    $is_coop_xtra: Boolean,
    $is_ecology: Boolean,
    $is_frozen: Boolean,
    $is_offer: Boolean,
    $is_active: Boolean,
    $product_id: [Int!],
    $sort: String,
    $isMembership: Boolean,
    $t: String
  ) {
    products(
      q: $q
      category_id: $category_id
      offset: $offset
      limit: $limit
      is_coop_xtra: $is_coop_xtra
      is_ecology: $is_ecology
      is_frozen: $is_frozen
      is_offer: $is_offer
      is_active: $is_active
      product_id: $product_id
      sort: $sort,
      isMembership: $isMembership,
      t: $t
    ) {
      items {
        _id
        name
        slug
        unit
        weight
        price
        salePrice
        description
        image
        category_id
        is_coop_xtra
        is_ecology
        is_frozen
        store_id_list
        base_value
        barcode
        item_number
        store_price_list {
          store_id
          price
        }
        related_list
        weight_list
        offer {
          _id
          product_id
          sale_price
          type
          quantity
        }
        category {
          _id
          order
        }
        status
        total_bought
        order
      }
      hasMore,
      total
    }
  }
`;

export const GET_SUGGESTION = gql`
  query getSuggestion(
    $keyword: String!,
  ) {
    suggestProduct(
      keyword: $keyword,
    ) {
      _id
      text
      highlighted
      image
      slug
    }
  }
`;