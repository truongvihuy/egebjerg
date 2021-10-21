import { BadRequestException, NotFoundException, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { OrderQuickpay } from './order_quickpay.schema';
import { OrderDTO } from './order.dto';
import { Model } from 'mongoose';
import {
  NUMBER_ROW_PER_PAGE, USER_GROUP_STORE, USER_GROUP_ADMIN, ORDER_STATUS,
  MSG_CLAIM_PAYMENT_FAIL, NOTIFICATION_STATUS, MSG_CUSTOMER_CHANGE_CARD,
  MSG_CUSTOMER_CHANGE_PAYMENT_METHOD_TO_PBS, MSG_CUSTOMER_CHANGE_PAYMENT_METHOD_TO_CARD, FREE_NAME_PRODUCT_ID, MSG_CARD_INFORM_MISSING, MSG_CARD_INFORM_MISSING_NOT_ENOUGHT_CREDIT_LIMIT, MSG_NOTICE_STORE_CHANGE_PBS_TO_CARD_RECIEVED, MSG_NOTICE_STORE_CHANGE_PBS_TO_CARD_PACKED
} from '../config/constants';
import { CounterService } from '../counter/counter.service';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { MailService } from '../mail/mail.service';
import { getNow } from '../helper/time.helper';
import BaseService from '../helper/base.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { isAsscociatedProduct, isFreeNameProduct, isOverweight, isSpecialProduct } from '../helper/general.helper';
import { claimPayment, refundPayment, processPayment, cancelPayment } from '../helper/quickpay.helper';
import { StoresService } from '../stores/stores.service';
import { NotificationService } from '../notification/notification.service';
import { SettingService } from '../setting/setting.service';
import { docPackingSlip } from '../template/template-packing-slip';
import { createPDF } from '../helper/pdf.helper';
import { OrderBakeryService } from '../order-bakery/order-bakery.service';
import { merge } from 'lodash';

const ORDER_FORBIDEN_MESSAGE = 'Du har ikke tilladelse til denne ordre!';
const MSG_STORE_DO_NOT_HAVE_QP_INFO = 'Store do not have quickpay info';
interface OrdersResponse {
  order_list: Order[],
  total?: number
}

@Injectable()
export class OrderService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    private orderBakeryService: OrderBakeryService,
    private customerService: CustomersService,
    private storeService: StoresService,
    private productService: ProductsService,
    private mailService: MailService,
    private notificationService: NotificationService,
    private settingService: SettingService,
    @InjectModel('Order') public readonly orderModel: Model<Order>,
    @InjectModel('OrderQuickpay') public readonly orderQuickpayModel: Model<OrderQuickpay>
  ) {
    super(counterService, configService);
  }
  private readonly columns = ['_id', 'position', 'note', 'status', 'created_date', 'from_date', 'to_date', 'product_list', 'discount', 'delivery_fee', 'subtotal', 'amount', 'customer_id', 'customer_name', 'address_info', 'replacement_goods', 'payment_method', 'total_weight', 'overweight_fee', 'order_by_id', 'store_id'];
  private readonly collectionName = 'order';

  async findAll(query, user): Promise<OrdersResponse> {
    if (!!query._id) {
      let order = await this.orderModel.findOne({ _id: parseInt(query._id) }, { projection: 0 }, { limit: 1 });
      if (order && await this.checkOrderPermission(order, user)) {
        return {
          order_list: [order],
          total: 1,
        }
      }
    }
    let { limit = NUMBER_ROW_PER_PAGE, page = 1 } = query;
    limit = +limit; page = +page;

    let condition = {
      status: {$gt: ORDER_STATUS.complaint}
    };
    for (const key in query) {
      switch (key) {
        case 'page':
        case 'limit':
        case 'field': break;
        case 'from_date': condition['created_date'] = { ...condition['created_date'], ['$gte']: +query[key] }; break;
        case 'order': condition['created_date'] = { ...condition['created_date'], ['$gte']: +query[key] }; break;
        case 'to_date': condition['created_date'] = { ...condition['created_date'], ['$lte']: +query[key] }; break;
        case 'order_by_id': condition['order_by._id'] = +query[key]; break;
        case 'store_id': condition['store._id'] = +query[key]; break;
        case 'payment_method': condition[key] = query[key]; break;
        case 'created_date': condition[key] = { [`$${query.date_operator}`]: +query[key] }; break;
        case 'customer_id': condition['customer_id'] = +query[key]; break;
        case 'customer_name': {
          if (query.customer_name.startsWith('`')) {
            let customerId = query.customer_name.replace('`', '');
            if (customerId.length > 0) {
              condition['customer_id'] = parseInt(customerId);
            }
            break;
          }
          let queryElastic: any = {
            index: 'egebjerg-customer',
            size: 1000,
            body: {
              query: {
                bool: {
                  must: [{
                    'match': {
                      ['name']: query[key]
                    }
                  }],
                }
              }
            }
          };
          let elasticSearch = this.configService.get<any>('elasticSearch');
          const searchResult = (await elasticSearch.search(queryElastic)).body;
          let idList = [];
          if (searchResult.hits.total.value > 0) {
            searchResult.hits.hits.forEach(x => {
              idList.push(parseInt(x._id))
            });
            condition['customer_id'] = { '$in': idList };
          } else {
            condition[key] = new RegExp(query[key], 'ui');
          }
          break;
        }
        default: {
          if (!this.columns.includes(key)) {
            throw new BadRequestException();
          }
          condition[key] = +query[key];
          break;
        }
      }
    }

    let options = {
      sort: { _id: -1 },
      limit,
      skip: (page - 1) * limit
    };

    if (user.user_group_id === USER_GROUP_STORE) {
      if (user.store_id) {
        condition['store._id'] = user.store_id;
      } else {
        return {
          total: 0,
          order_list: [],
        }
      }
    }
    const result = await this.findByCondition(condition, null, options);

    let response: OrdersResponse = {
      order_list: result,
      total: await this.orderModel.countDocuments(condition).exec(),
    }

    return response;
  }

  async findAllOrderBakery(condition: any = {}, projection: any = null, options: any = {}) {
    let result = await this.orderModel.aggregate([
      { $match: condition, },
      { $sort: options.sort ?? { _id: 1 } },
      { $project: projection ?? { session: 0, product_list: 0 }, },
      {
        $lookup: {
          from: 'order_bakery',
          localField: '_id',
          foreignField: 'order_id',
          as: 'bakery_product_list'
        }
      },
    ]).exec();

    result = result.filter(order => order.bakery_product_list.length);

    return result;
  }

  async findByCondition(condition: any = {}, projection: any = null, option: any = {}): Promise<Order[]> {
    return await this.orderModel.aggregate([
      {
        $match: condition,
      }, {
        $sort: option.sort ?? { _id: 1 }
      }, {
        $skip: option.skip ?? 0
      }, {
        $limit: option.limit
      }, {
        $project: projection ?? {
          session: 0,
        },
      },
      {
        $lookup: {
          from: 'notification',
          localField: '_id',
          foreignField: 'order_id',
          as: 'status_note'
        }
      },
      {
        $set: {
          status_note: {
            $first: '$status_note'
          }
        }
      }, {
        $set: {
          status_note: '$status_note.message'
        }
      }
    ]).exec();
  }

  async findOneByCondition(condition: any): Promise<Order> {
    return await this.orderModel.findOne(condition, { projection: 0 }, { lean: true });
  }

  async groupProductsInOrder(order: any) {
    const id_list = [];
    order.product_list?.forEach((e: any) => {
      if (e._id) {
        id_list.push(e._id);
      }
    });
    const { product_list } = id_list.length ? await this.productService.find({ id_list: id_list.join(',') }) : { product_list: [] };
    let productList = {};
    order.product_list?.forEach((item: any) => {
      const product = product_list.find((e: any) => e._id === item._id);
      const key = !isFreeNameProduct(item._id) ? `p-${item._id}-${item.weight_option ?? ''}` : `sp-${item._id}-${item.position}`;
      if (productList[key]) {
        productList[key] = {
          ...productList[key],
          quantity: productList[key].quantity + item.quantity,
          discount_quantity: productList[key].discount_quantity + (item.discount ? item.quantity : 0),
          total: productList[key].total + item.total,
          discount: productList[key].discount + (item.discount ?? 0),
        }
      } else {
        productList[key] = {
          _id: item._id,
          name: item.name,
          image: item.image,
          unit: item.unit,
          item_number: item.item_number,
          status: product?.status,
          weight: item.weight_option ? item.weight_option * 1000 : item.weight,
          price: item.weight_option ? (item.price + (item.discount ?? 0)) / item.quantity : item.price,
          barcode: item.barcode,
          note: item.note,
          order_category: Math.min(...(product?.category?.map(e => e.order) ?? [])),
          order_product: product?.order ?? Infinity,
          quantity: item.quantity,
          discount_quantity: item.discount ? item.quantity : 0,
          total: item.total,
          discount: item.discount ?? 0,
        }
      }
    });
    let value = {
      ...order,
      product_list: Object.values(productList).sort((x: any, y: any) => {
        let conditionSwap = +isOverweight(y._id) - +isOverweight(x._id);
        if (conditionSwap !== 0) {
          return conditionSwap;
        };
        conditionSwap = +isSpecialProduct(y._id) - +isSpecialProduct(x._id);
        if (conditionSwap !== 0) {
          return conditionSwap;
        };
        conditionSwap = +isAsscociatedProduct(y) - +isAsscociatedProduct(x);
        if (conditionSwap !== 0) {
          return conditionSwap;
        };
        return (
          x.order_category !== y.order_category ? x.order_category - y.order_category : x.order_product - y.order_product
        );
      }),
    };
    return value;
  }

  async printPackingSlip(_id: number, user) {
    let order: any = await this.findOneByCondition({ _id });
    await this.checkOrderPermission(order, user);
    order = await this.groupProductsInOrder(order);

    let customer = null;
    try {
      customer = await this.customerService.findById(order.customer_id);
    } catch (e) { };

    let settings = await this.settingService.findAll();

    return (await createPDF(docPackingSlip(order, customer, settings)));
  }

  async create(order, user) {
    let error_message = null;
    await this.checkOrderPermission(order, user);
    let customer = (await this.customerService.findByCondition({ _id: order.customer_id }, {}, { limit: 1 }))[0] ?? null;
    if (!customer) {
      throw new NotFoundException('Ingen By fundet kunder');
    }
    let lastOrder = await this.findOneByCondition({ customer_id: order.customer_id });
    order.position = lastOrder ? lastOrder.position + 1 : 1;
    order.created_date = getNow();

    let store = null;
    if (order.payment_method === 'Card') {
      store = await this.getStoreAndCheckQuickPayInfo(order.store._id);
    } else {
      store = await this.storeService.findById(order.store._id);
    }

    const model = new this.orderModel({
      order_by: {
        _id: user._id,
        name: user.name,
      },
      ...order,
      product_list: order.product_list.map((product: any) => {
        const { price_weight_option, is_baked, ...tmpProduct } = product;
        return tmpProduct;
      }),
    });
    let result = await this.save(model, this.collectionName, async (_id, model) => {
      model.session = await bcrypt.hash(`${order.customer_id}_${_id}_${this.configService.get('secretCode')}`, 12);
    });

    if (result) {
      await this.orderBakeryService.createMany(merge({}, result, { product_list: order.product_list }));
      let paymentResult = null;
      let orderQuickpay = null;
      let updateData: any = {};

      orderQuickpay = await this.createOrderQuickpay(result._id, null);
      updateData.order_quickpay_id = orderQuickpay._id;
      if (order.payment_method === 'Card') {
        paymentResult = await processPayment(store.quickpay_info.api_key, result._id, order.amount, customer);

        if (paymentResult && paymentResult.payment_id) {

          await this.orderQuickpayModel.updateOne({ _id: orderQuickpay._id }, { $set: { payment_id: paymentResult.payment_id } });
        }

        if (paymentResult && paymentResult.error_message) {
          if (customer.card && customer.card.length > 0 && customer.credit_limit < result.amount) {
            await this.orderModel.deleteOne({ _id: result._id });
            throw new BadRequestException(MSG_CARD_INFORM_MISSING_NOT_ENOUGHT_CREDIT_LIMIT);
          } else if (customer.credit_limit >= result.amount) {
            updateData.payment_method = 'PBS';
            updateData.card_to_pbs = true;
            error_message = MSG_CARD_INFORM_MISSING;
          } else {
            updateData.status = ORDER_STATUS.received;
            await this.updateById(result._id, { $set: updateData }, this.orderModel);
            await this.createNotificationPaymentFail({
              ...order,
              ...updateData,
              _id: result._id,
            }, user, customer);
            throw new BadRequestException(paymentResult.error_message);
          }
        } else {
          updateData.is_saved_card = true;
          updateData.status = ORDER_STATUS.received;
        }

      }
      result = await this.updateById(result._id, { $set: updateData }, this.orderModel);

      await this.customerService.cleanCart(order.customer_id);

      let total_bought = {};
      order.product_list.forEach((e: any) => {
        total_bought[e._id] = (total_bought[e._id] ?? 0) + e.quantity;
      });
      await this.productService.updateTotalBought(total_bought, order.customer_id);

      if (order.email) {
        await this.mailService.sendOrderMail(model, [order.email]);
      }

      if (store) {
        let pdfPackingSlip = (await this.printPackingSlip(result._id, user));
        await this.mailService.sendMail('Butikken du lige har bestilt', { attachments: [{ path: pdfPackingSlip }], }, store.email);
      }
      return {
        ...result,
        error_message
      };
    }
    throw new BadRequestException('Opret fejl');
  }


  async update(_id: number, data, user) {
    if (!!data._id) {
      delete data._id;
    }
    let conditionOrder: any = { _id };
    if (user.user_group_id === USER_GROUP_STORE && user.store_id) {
      conditionOrder['store._id'] = user.store_id;
    }
    let order = await this.orderModel.findOne(conditionOrder);
    if (order) {
      await this.checkOrderPermission(order, user);
      if (data._id) {
        delete data._id;
      }
      return await this.updateById(_id, data, this.orderModel);
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async updatePaymentMethod(_id: number, data, user) {
    if (!!data._id) {
      delete data._id;
    }
    let conditionOrder: any = { _id };
    if (user.user_group_id === USER_GROUP_STORE && user.store_id) {
      conditionOrder['store._id'] = user.store_id;
    }
    let order = await this.orderModel.findOne(conditionOrder);

    if (order) {
      let notification: any = {
        store_id: order.store._id,
        order_id: order._id,
        user_create: {
          _id: user._id,
          name: user.name,
          date: getNow()
        },
        user_update: null,
        from_store: false,
        status: NOTIFICATION_STATUS.new
      }
      let customer = (await this.customerService.findByCondition({ _id: order.customer_id }, {}, { limit: 1 }))[0] ?? null;
      if (order.payment_method === data.payment_method) {
        //customer replace card to resolve payment
        if (order.payment_method === 'Card' && data.updated_card) {
          if (order.status == ORDER_STATUS.received) {
            data.status = ORDER_STATUS.received;
            if (customer.cart?.order_id === order._id) {
              await this.customerService.cleanCart(customer._id);
            }
          } else if (order.status == ORDER_STATUS.packedPaymentIssue) {
            notification.message = MSG_CUSTOMER_CHANGE_CARD.replace('{order_id}', order._id.toString()).replace('{customer_name}', customer.name);
          }
        } else {
          throw new BadRequestException('Intet ændres');
        }
      } else {
        //customer want to change to card
        if (!customer) {
          throw new BadRequestException('Ingen By fundet kunder');
        }
        let store = await this.getStoreAndCheckQuickPayInfo(order.store._id);
        if (data.payment_method === 'Card') {
          if (order.status === ORDER_STATUS.received) {
            try {
              let { payment_id } = await processPayment(store.quickpay_info.api_key, order._id, order.amount, customer);
              data.payment_id = payment_id;
            } catch (e) {
              data.status = ORDER_STATUS.received;
            }
          }
          if (order.status === ORDER_STATUS.packedPaymentIssue) {
            notification.message = MSG_CUSTOMER_CHANGE_PAYMENT_METHOD_TO_CARD.replace('{order_id}', order._id.toString()).replace('{customer_name}', customer.name);
          }
          if (order.status === ORDER_STATUS.received) {
            notification.message = MSG_NOTICE_STORE_CHANGE_PBS_TO_CARD_RECIEVED.replace('{order_id}', order._id.toString()).replace('{customer_name}', customer.name);
          }
          if (order.status === ORDER_STATUS.packed) {
            notification.message = MSG_NOTICE_STORE_CHANGE_PBS_TO_CARD_PACKED.replace('{order_id}', order._id.toString()).replace('{customer_name}', customer.name);
          }
          if (order.status === ORDER_STATUS.packed) {
            data.status = ORDER_STATUS.packedPaymentIssue;
          }
        } else {
          if (order.status === ORDER_STATUS.packedPaymentIssue) {
            notification.message = MSG_CUSTOMER_CHANGE_PAYMENT_METHOD_TO_PBS.replace('{order_id}', order._id.toString()).replace('{customer_name}', customer.name);
          }
          if (order.status === ORDER_STATUS.received) {
            data.status = ORDER_STATUS.received;
          }
          //customer want to change to pbs
          if (customer.cart?.order_id === order._id) {
            await this.customerService.cleanCart(customer._id);
          }
          //clear payment_id
          if (order.status === ORDER_STATUS.received) {
            let orderQuickpay = await this.orderQuickpayModel.findOne({ _id: order.order_quickpay_id });
            if (orderQuickpay.payment_id) {
              await cancelPayment(store.quickpay_info.api_key, orderQuickpay.payment_id);
            }
          }
          data.payment_id = null;
        }
      }

      if (notification.message) {
        await this.notificationService.create(notification);
      }
      return await this.updateById(_id, data, this.orderModel);
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async checkOrderPermission(order, user) {
    if (user.user_group_id === USER_GROUP_STORE && user.store_id && user.store_id != order.store._id) {
      throw new ForbiddenException(ORDER_FORBIDEN_MESSAGE);
    }
    return true;
  }

  async updateOverweightRate(_id: number, data) {
    let order: any = await this.orderModel.findOne({ _id });
    if (order) {
      if (order.is_overweight) {
        const dataUpdate = {
          '$set': {
            [`overweight_rate`]: {
              value: data.value,
              comment: data.comment,
            },
          }
        }
        return await this.updateById(_id, dataUpdate, this.orderModel);
      }
      throw new BadRequestException('Produktet er vægt nok');
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async claimMoreOrder(id: number, data, user) {
    let conditionOrder: any = { _id: id };
    if (user.user_group_id === USER_GROUP_STORE && user.store_id) {
      conditionOrder['store._id'] = user.store_id;
    }
    let order = await this.findOneByCondition(conditionOrder);
    if (order) {
      let customer = (await this.customerService.findByCondition({ _id: order.customer_id }, {}, { limit: 1 }))[0] ?? null;
      if (!customer) {
        throw new BadRequestException('Ingen By fundet kunder');
      }
      let lastOrder = await this.findOneByCondition({ customer_id: order.customer_id });
      let position = lastOrder ? lastOrder.position + 1 : 1;
      await this.checkOrderPermission(order, user);
      let freeNameProduct = await this.productService.findOneByCondition({ _id: FREE_NAME_PRODUCT_ID }, null, { lean: true });
      let paymentId = null;
      let paymentResult = null;
      let status = ORDER_STATUS.received;
      let store = null;
      let amountClaimMore = data.amount_claim;
      if (customer.payment_method === 'Card') {
        store = await this.getStoreAndCheckQuickPayInfo(order.store._id);
      }

      let newOrder = new this.orderModel({
        ...order,
        payment_method: customer.payment_method,
        status: status,
        payment_id: paymentId,
        product_list: [
          {
            ...freeNameProduct,
            name: `Tillæg til ordre ${order._id}`,
            price: amountClaimMore
          }
        ],
        amount: amountClaimMore,
        amount_claim: (status === ORDER_STATUS.packed) ? amountClaimMore : null,
        amount_refund: null,
        position,
        created_date: getNow(),
        claim_date: status === ORDER_STATUS.packed ? getNow() : null,
        parent_order_id: order._id,
        shipping_code: null,
        is_overweight: false,
      });

      let result = await this.save(newOrder, this.collectionName, async (_id, model) => {
        model.session = await bcrypt.hash(`${order.customer_id}_${_id}_${this.configService.get('secretCode')}`, 12);
      });

      if (result) {
        if (customer.payment_method === 'Card') {
          paymentResult = await processPayment(store.quickpay_info.api_key, result._id, amountClaimMore, customer);
          if (paymentResult && paymentResult.payment_id) {
            paymentId = paymentResult.payment_id;
          }
          let resultClaim = await claimPayment(store.quickpay_info.api_key, paymentId, amountClaimMore);
          if (resultClaim) {
            status = ORDER_STATUS.packed;
          } else {
            status = ORDER_STATUS.received;
          }

          result = await this.updateById(result._id, {
            '$set': {
              status: status,
              payment_id: paymentId,
            }
          }, this.orderModel);
        }

        await this.updateById(order._id, {
          $push: {
            'child_order_id_list': newOrder._id
          }
        }, this.orderModel);
        return result;
      }
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async claimOrder(_id: number, data, user) {
    let now = getNow();
    if (!!data._id) {
      delete data._id;
    }
    let conditionOrder: any = { _id };
    if (user.user_group_id === USER_GROUP_STORE && user.store_id) {
      conditionOrder['store._id'] = user.store_id;
    }
    let order = await this.orderModel.findOne(conditionOrder);
    if (order) {
      let customer = (await this.customerService.findByCondition({ _id: order.customer_id }, {}, { limit: 1 }))[0] ?? null;
      let orderQuickpay = await this.orderQuickpayModel.findOne({ _id: order.order_quickpay_id });
      if (!customer) {
        throw new BadRequestException('Ingen By fundet kunder');
      }
      await this.checkOrderPermission(order, user);
      if (data._id) {
        delete data._id;
      }
      if (!!data.amount_claim && (typeof order.amount_claim === 'undefined' || order.amount_claim === null || (!!order.amount_claim && order.amount_claim != data.amount_claim))) {
        let store = await this.getStoreAndCheckQuickPayInfo(order.store._id);
        if (order.payment_method === 'Card') {
          let resultClaim = null;
          try {
            if (order.status === ORDER_STATUS.packedPaymentIssue) {
              // claim again after user add new card
              let newOrderQuickpay = await this.createOrderQuickpay(order._id, null);
              let { payment_id } = await processPayment(store.quickpay_info.api_key, newOrderQuickpay._id, data.amount_claim, customer);
              resultClaim = await claimPayment(store.quickpay_info.api_key, payment_id, data.amount_claim);
              if (resultClaim) {
                data.order_quickpay_id = newOrderQuickpay._id;
              }
            } else {
              if (orderQuickpay.payment_id) {
                resultClaim = await claimPayment(store.quickpay_info.api_key, orderQuickpay.payment_id, data.amount_claim);
              } else {
                let { payment_id } = await processPayment(store.quickpay_info.api_key, orderQuickpay._id, data.amount_claim, customer);
                resultClaim = await claimPayment(store.quickpay_info.api_key, payment_id, data.amount_claim);
              }
            }
          } catch (e) {
            //claim payment fail
            this.logError(e, 'order', __filename);
          }
          if (!resultClaim) {
            await this.createNotificationPaymentFail(order, user, customer);
            data = {
              amount_claim: null,
              status: ORDER_STATUS.packedPaymentIssue
            }
            // throw new BadRequestException('Can not claim payment');
          } else {
            data = {
              status: ORDER_STATUS.packed,
              amount_claim: data.amount_claim,
              claim_by: {
                _id: user._id,
                name: user.name
              },
              claim_date: now
            }
          }
        } else {
          //PBS
          data = {
            status: ORDER_STATUS.packed,
            amount_claim: data.amount_claim,
            claim_by: {
              _id: user._id,
              name: user.name
            },
            claim_date: now
          }
        }
      }
      return await this.updateById(_id, data, this.orderModel);
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async refundOrder(_id: number, data, user) {
    let now = getNow();
    if (!!data._id) {
      delete data._id;
    }
    let conditionOrder: any = { _id };
    if (user.user_group_id === USER_GROUP_STORE && user.store_id) {
      conditionOrder['store._id'] = user.store_id;
    }
    let order = await this.orderModel.findOne(conditionOrder);
    if (order) {
      let orderQuickpay = await this.orderQuickpayModel.findOne({ _id: order.order_quickpay_id });
      await this.checkOrderPermission(order, user);
      if (data._id) {
        delete data._id;
      }
      if (!!data.amount_refund && typeof order.amount_refund === 'undefined') {
        let store = await this.getStoreAndCheckQuickPayInfo(order.store._id);
        let resultRefund = await refundPayment(store.quickpay_info.api_key, orderQuickpay.payment_id, data.amount_refund);
        if (resultRefund === false) {
          throw new BadRequestException('Can not refund payment');
        }
        data = {
          amount_refund: data.amount_refund,
          refund_by: {
            _id: user._id,
            name: user.name
          },
          refund_date: now
        }
      } else {
        throw new BadRequestException('Can not refund payment');
      }

      return await this.updateById(_id, data, this.orderModel);
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async createNotificationPaymentFail(order, user, customer) {
    await this.notificationService.create({
      store_id: order.store._id,
      order_id: order._id,
      message: MSG_CLAIM_PAYMENT_FAIL.replace('{order_id}', order._id.toString()).replace('{customer_name}', customer.name),
      user_create: {
        _id: user._id,
        name: user.name,
        date: getNow(),
      },
      user_update: null,
      from_store: true,
      status: NOTIFICATION_STATUS.new
    });
  }

  async getStoreAndCheckQuickPayInfo(storeId) {
    let store = await this.storeService.findById(storeId);
    if (store === null) {
      throw new BadRequestException('Ingen By fundet Brugser');
    }
    if (typeof store.quickpay_info === 'undefined' || store.quickpay_info === null || typeof store.quickpay_info.api_key === 'undefined' || store.quickpay_info.api_key === null || store.quickpay_info.api_key === '') {
      throw new BadRequestException(MSG_STORE_DO_NOT_HAVE_QP_INFO);
    }
    return store;
  }

  async createOrderQuickpay(orderId, paymentId) {
    let newOrderQuickpay = new this.orderQuickpayModel({
      order_id: orderId,
      payment_id: paymentId,
    });
    let result = await this.save(newOrderQuickpay, 'order_quickpay');
    return result;
  }
}
