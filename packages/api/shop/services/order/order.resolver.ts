import { Resolver, Query, Arg, Int, Mutation, Ctx } from 'type-graphql';
import Order, { OrderResponse } from './order.type';
import { getOrderList, addOrder, getOrder, updateOrder } from './order.query';
import { getProductList, updateTotalBought } from '../product/product.query';
import { ApolloError } from 'apollo-server-errors';
import { MSG_PRODUCT_CANNOT_ORDER, MSG_ITEM_NOT_FOUND, PRODUCT_STATUS, MAIL_ID, MSG_ORDER_HAVE_PRICE_CHANGES } from '../../../config/constant';
import { processOrderItemList } from '../../../../share/order.helper';
import { checkMembership } from '../../../../share/customer.helper';
import { resetCart } from '../../helpers/cart-helper';
import { checkCustomerContext, findAndProcessCustomer } from '../../helpers/authenticate-helper';
import { processPayment, createCardGetLink, createOrderQuickpay } from '../../helpers/quickpay-helper';
import { getCounter, getDb, insertOne } from '../../../helper/db.helper';
import config from '../../../config/config';
import { ORDER_STATUS, FREE_NAME_PRODUCT_ID } from '../../../../share/constant';
import { sendMail } from '../../../utils/sendMail';
import { cloneDeep, merge } from 'lodash';
import { addOrderBakery } from './order-bakery.query';
const bcrypt = require('bcrypt');

const groupProductInOrder = async (order: any) => {
  const id_list = order.products.map((e: any) => e._id)
  const { productList } = await getProductList({ '_id': { '$in': id_list } }, null, 0, id_list.length, undefined, undefined, false);
  let products: any = {};
  order.products.forEach((ele: any) => {
    const item = productList.find((e: any) => e._id === ele._id);
    const key = `${ele._id}-${ele.weight_option ?? ''}`;
    if (products[key]) {
      products[key] = {
        ...products[key],
        quantity: products[key].quantity + ele.quantity,
        discount_quantity: products[key].discount_quantity + (ele.discount ? ele.quantity : 0),
        total: products[key].total + ele.total,
        discount: products[key].discount + (ele.discount ?? 0),
      }
    } else {
      products[key] = {
        _id: ele._id,
        name: ele.name,
        image: ele.image,
        weight: ele.weight_option ?? ele.weight,
        price: ele.price_weight_option ?? ele.price,
        barcode: ele.barcode,
        note: ele.note,
        order_category: Math.min(...(item?.category?.map((e: any) => e.order) ?? [])),
        order_product: item?.order ?? Infinity,
        quantity: ele.quantity,
        discount_quantity: ele.discount ? ele.quantity : 0,
        total: ele.total,
        discount: ele.discount ?? 0,
      }
    }
  });
  let value = {
    ...order,
    products: Object.values(products).sort((x: any, y: any) => (
      x.order_category !== y.order_category ? x.order_category - y.order_category : x.order_product - y.order_product
    )),
  };
  return value;
}
@Resolver()
export class OrderResolver {

  @Query((returns) => OrderResponse, { description: 'Get all the Orders' })
  async orders(
    @Arg('limit', (type) => Int, { defaultValue: 5 }) limit: number,
    @Arg('offset', (type) => Int, { defaultValue: 0 }) offset: number,
    @Arg('customer_id', (type) => Int, { nullable: true }) customer_id: number,
    @Arg('order_id', (type) => Int, { nullable: true }) order_id: number,
    @Arg('position', (type) => Int, { nullable: true }) position: number,
    @Ctx() context: any,
  ): Promise<OrderResponse> {
    checkCustomerContext(context);

    let condition: any = {};
    condition['customer_id'] = context.customer.affectedCustomerId;
    if (order_id) {
      condition['_id'] = {
        '$lte': order_id
      };
    }
    if (position) {
      condition['position'] = {
        '$lte': position
      };
    }

    let { orderList, countTotal } = await getOrderList(condition, offset, limit);
    let filteredData = {
      hasMore: orderList.length > 0 && orderList[orderList.length - 1].position > 1,
      items: orderList
    }
    return new OrderResponse({
      total: countTotal,
      ...filteredData
    });
  }

  @Query((returns) => Order, { description: 'Get all the Orders' })
  async orderBySession(
    @Arg('session', () => String) session: string,
  ): Promise<Order> {
    let order = await getOrder({ session });
    order = await groupProductInOrder(order);
    return order;
  }

  @Mutation(() => Order, { description: 'Add an Order' })
  async addOrder(
    @Ctx() context: any,
    @Arg('orderInput') orderInput: string,
  ): Promise<Order | undefined> {
    checkCustomerContext(context);
    let db = await getDb();
    let customer = await findAndProcessCustomer({ _id: context.customer.affectedCustomerId });
    let store = await db.collection('store').findOne({ _id: customer.store_id });
    let settingExtraMap: any = {};
    let settingExtraList: any = await db.collection('setting').find({ key: { $in: ['extra_payment_title', 'extra_payment_amount'] } }).toArray();
    settingExtraList.forEach((x: any) => {
      settingExtraMap[x.key] = x.value;
    });
    let orderResult: any = undefined;
    if (customer.cart.order_id) {
      orderResult = await db.collection('order').findOne({ _id: customer.cart.order_id });
    }

    let dataInput = JSON.parse(orderInput);
    let condition: any = {
      '_id': {
        '$in': dataInput.product_list.map((e: any) => e._id),
      },
      // 'status': {
      //   '$gt': 0,
      // },
    };
    const { productList } = await getProductList(condition, context.customer?.store_id ?? null, 0, condition['_id']['$in'].length, undefined, undefined, false);

    const itemCartsList: any[] = [];
    const carts = dataInput.product_list;
    for (const cart of carts) {
      let product: any = productList.find((e: any) => e._id === cart._id);
      if (product._id == FREE_NAME_PRODUCT_ID && cart.name == settingExtraMap['extra_payment_title']) {
        product.price = cart.price;
      }
      if (!product) {
        throw new ApolloError(MSG_ITEM_NOT_FOUND.replace('{_id}', cart._id), 'MSG_ITEM_NOT_FOUND');
      }
      if (product.status === PRODUCT_STATUS.INACTIVE) {
        throw new ApolloError(MSG_PRODUCT_CANNOT_ORDER.replace('{name}', product.name), 'MSG_PRODUCT_CANNOT_ORDER');
      }
      let associated_list = null;
      const idList = product.associated_list?.filter((e: any) => e.amount).map((e: any) => e._id);
      if (idList?.length) {
        let associatedProductList = await getProductList({ _id: { '$in': idList } }, context.customer?.store_id ?? null, 0, idList.length, undefined, undefined, false);
        associated_list = associatedProductList.productList;
        associated_list.forEach((element: any) => {
          let item = product.associated_list.find((e: any) => e._id === element._id);
          element.amount = item.amount;
        });
      }
      itemCartsList.push({
        product,
        cart,
        associated_list,
      });
    }

    try {
      const { product_list, error, total, ...price }
        = processOrderItemList(itemCartsList, customer, dataInput, true);

      if (dataInput.amount !== price.amount) {
        throw new ApolloError(MSG_ORDER_HAVE_PRICE_CHANGES);
      }

      let order = {
        customer_id: context.customer.affectedCustomerId,
        customer_name: customer.name,
        status: ORDER_STATUS.received,
        replacement_goods: dataInput.replacement_goods,
        payment_method: dataInput.payment_method,
        note: dataInput.note,
        address_info: dataInput.address_info,
        phone: customer.phone,
        email: customer.email,
        store_customer_number: customer.store_customer_number,
        membership_number: customer.membership_number,
        store: customer.store ? {
          _id: customer.store._id,
          name: customer.store.name,
        } : null,
        municipality: customer.municipality ? {
          _id: customer.municipality._id,
          name: customer.municipality.name,
        } : null,
        admin_comment: customer.admin_comment,
        product_list: product_list.map((product: any) => {
          const { price_weight_option, is_baked, __typename, ...tmpProduct } = product;
          return tmpProduct;
        }),
        order_by: null,
        ...price,
        created_date: ~~(Date.now() / 1000),
        status_note: 'Payment failed',
      };
      let payment_id = null;
      let payment_url = null;
      if (!orderResult) {
        orderResult = await addOrder(order);
        await addOrderBakery(merge({}, order, { product_list }));
      }
      //save order id to cart
      await db.collection('customer').updateOne({ _id: customer._id },
        {
          $set: {
            'cart.order_id': orderResult._id
          }
        }
      );
      let isSaveCard = null;
      let orderQuickpay = null;
      if (customer.payment_method == 'Card') {
        orderQuickpay = await createOrderQuickpay(orderResult._id);
        if (dataInput.use_other_card) {
          if (dataInput.save_card) {
            let addCardUrl = await createCardGetLink(store.quickpay_info.api_key, context.customer.store_id, customer._id, orderResult._id);
            payment_url = addCardUrl;
            isSaveCard = true;
          } else {
            let resultProcessPayment = await processPayment(store.quickpay_info.api_key, orderResult._id, order.amount);
            payment_id = resultProcessPayment.payment_id ?? null;
            payment_url = resultProcessPayment.payment_url ?? null;
            isSaveCard = false;
          }
        } else {
          payment_id = await processPayment(store.quickpay_info.api_key, orderQuickpay._id, order.amount, customer);
          isSaveCard = true;
        }
      } else {
        order.status = ORDER_STATUS.received;
        payment_id = null;
        await resetCart(customer._id);
      }
      let dataUpdate: any = cloneDeep(order);
      if (orderQuickpay && payment_id) {
        await db.collection('order_quickpay').updateOne({ _id: orderQuickpay._id }, { $set: { payment_id } });
        dataUpdate.order_quickpay_id = orderQuickpay._id;
      }
      if (isSaveCard != null) {
        dataUpdate.is_saved_card = isSaveCard;
      }
      await updateOrder(orderResult._id, dataUpdate);
      orderResult.payment_url = payment_url;

    } catch (error) {
      if (error === 'pbs_settings') {
        let pbsSetting = await db.collection('setting').findOne({ key: 'pbs_settings' });
        throw new ApolloError(pbsSetting.value.exceed_message_backend.value, '@PUBLIC_CREDIT_REACH_LIMIT')
      } else {
        throw error;
      }
    }
    if (customer.email) {
      await sendMail({
        customer_id: customer._id,
        home_helper_id: context.customer._id,
        order_id: orderResult._id,
        mail_id: MAIL_ID.order_is_created
      });
    }
    return orderResult;
  }
}