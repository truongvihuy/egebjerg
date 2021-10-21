export const cartSchema = `
  cart {
    _id
    name
    quantity
    price
    note
    position
    weight_option
  }
  product {
    _id
    name
    slug
    unit
    weight
    price
    image
    store_id_list
    weight_list
    base_value
    barcode
    item_number
    store_price_list {
      store_id
      price
    }
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
  }
  associated_list {
    _id
    name
    slug
    unit
    weight
    price
    image
    store_id_list
    weight_list
    base_value
    barcode
    item_number
    store_price_list {
      store_id
      price
    }
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
    amount
  }
`