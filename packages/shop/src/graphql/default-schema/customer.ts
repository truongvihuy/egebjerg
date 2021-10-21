export const customerSchema = `
  _id
  name
  username
  email
  phone
  address
  store_customer_number
  membership_number 
  payment_method
  credit_limit
  delivery_fee
  store_id
  store {
    _id
    name
    address
    payment
    checkout_info {
      phone
      email
      cvr_number
    }
  }
  zip_code {
    _id
    zip_code
    city_name
    municipality_name
  }
  municipality {
    _id
    name
    weight_limit
    overweight_price
  }
  store_zip_code {
    _id
    zip_code
    city_name
    municipality_name
  }
  active
  type
  favorite_list
  most_bought_list
  replacement_goods {
    ordinary
    promotion
    milk_and_bread
  }
  card {
    _id
    type
    name
    cardType
    bin
    lastFourDigit
  }
`;