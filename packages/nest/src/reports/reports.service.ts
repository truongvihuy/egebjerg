import { Injectable, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderBakery } from '../order-bakery/order-bakery.schema';
import { ORDER_STATUS } from '../config/constants';
import { Order } from '../order/order.schema';
import { Store } from '../stores/stores.schema';
@Injectable()
export class ReportsService {
  constructor(
    @InjectModel('OrderBakery') public readonly orderBakeryModel: Model<OrderBakery>,
    @InjectModel('Order') public readonly orderModel: Model<Order>,
    @InjectModel('Store') public readonly storeModel: Model<Store>
  ) { }

  async reportOverWeight(query: any) {
    let storeList = await this.storeModel.find({}, { _id: 1, name: 1 }).exec();

    let response = [];
    for (let store of storeList) {
      const reportList = await this.reportOverWeightStore({ ...query, store_id: +store._id });
      let item = {
        store_id: store._id,
        store_name: store.name,
        overweight_order_quantity: 0,
        overweight_fee_quantity: 0,
        total_overweight_fee: 0,
        report_list: reportList,
      };
      reportList.forEach(e => {
        item.overweight_order_quantity += e.overweight_order_quantity;
        item.overweight_fee_quantity += e.overweight_fee_quantity;
        item.total_overweight_fee += e.total_overweight_fee;
      });
      response.push(item);
    }

    return response;
  }

  async reportOverWeightStore(query: any) {
    if (!query.store_id || !query.from_date || !query.to_date) {
      throw new BadRequestException();
    }
    let condition: any = {
      date: {
        $gte: +query.from_date,
        $lte: +query.to_date,
      },
      status: ORDER_STATUS.canceled,
      'store._id': +query.store_id,
    };

    let pipeline = [
      {
        $match: condition
      },
      {
        $group: {
          _id: `$municipality._id`,
          order_total: { $sum: '$amount' },
          order_quantity: { $sum: 1 },
          overweight_order_quantity: { $sum: { '$cond': [{ $eq: ['$is_overweight', true] }, 1, 0] } },
          total_weight: { $sum: '$total_weight' },
          total_overweight: { $sum: '$overweight' },
          overweight_fee_quantity: { $sum: { '$cond': [{ $eq: ['$is_overweight', true] }, 1, 0] } },
          total_overweight_fee: { $sum: '$overweight_fee' }
        }
      },
      {
        $lookup: {
          from: 'municipality',
          localField: '_id',
          foreignField: '_id',
          as: 'municipality'
        }
      },
      {
        $set: {
          municipality: {
            $arrayElemAt: ['$municipality', 0]
          },
        }
      }
    ];
    const result = await this.orderModel.aggregate(pipeline);
    return result;
  }

  async reportOrderBakery(query: any) {
    const pipeline = [
      {
        $match: {
          date: {
            $gte: +query.from_date,
            $lte: +query.to_date,
          },
          is_bakery: true,
        }
      },
      {
        $group: {
          _id: '$product_id',
          name: { $first: '$name' },
          image: { $first: '$image' },
          item_number: { $first: '$item_number' },
          unit: { $first: '$unit' },
          barcode: { $first: '$barcode' },
          price: { $first: '$price' },
          quantity: { $sum: '$quantity' },
          total: { $sum: '$total' },
          order_id_list: { $push: '$order_id', },
        },
      },
      {
        $lookup: {
          from: 'order',
          localField: 'order_id_list',
          foreignField: '_id',
          as: 'order_list',
        },
      },
    ];
    return this.orderBakeryModel.aggregate(pipeline);
  }
}
