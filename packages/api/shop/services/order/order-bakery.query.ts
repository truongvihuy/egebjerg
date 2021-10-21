import { insertMany, insertOne } from '../../../helper/db.helper';

export const addOrderBakery = async (order: any) => {
  let orderBakeryListMap: any = {};

  order.product_list.forEach((product: any) => {
    if (product.is_baked) {
      if (orderBakeryListMap[product._id]) {
        orderBakeryListMap[product._id].quantity += product.quantity;
        orderBakeryListMap[product._id].total += product.total;
        orderBakeryListMap[product._id].discount += (product.discount ?? 0);
        orderBakeryListMap[product._id].discount_quantity += (product.discount > 0 ? product.discount_quantity : 0);
      } else {
        orderBakeryListMap[product._id] = {
          product_id: product._id,
          image: product.image,
          item_number: product.item_number,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          discount: product.discount ?? 0,
          note: product.note,
          unit: product.unit,
          barcode: product.barcode,
          discount_quantity: product.discount > 0 ? product.discount_quantity : 0,
          total: product.total,
          offer: product.offer,
          is_bakery: product.is_baked,
          associated_item_id: product.associated_item_id,
          date: order.created_date,
          store_id: order.store?._id,
          customer_id: order.customer_id,
          order_id: order._id,
        }
      }
    }
  });

  const orderBakeryList = Object.values(orderBakeryListMap);
  const orderBakeryListlength = orderBakeryList.length;
  for (let i = 0; i < orderBakeryListlength; i++) {
    await insertOne(orderBakeryList[i], 'order_bakery');
  }
};