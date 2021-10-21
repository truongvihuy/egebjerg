import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { CounterService } from '../counter/counter.service';
import { OrderBakery } from './order-bakery.schema';
import BaseService from '../helper/base.service';

@Injectable()
export class OrderBakeryService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    @InjectModel('OrderBakery') private readonly orderBakeryModel: Model<OrderBakery>
  ) {
    super(counterService, configService);
  }

  private readonly collectionName = 'order_bakery';

  async findAll(condition) {
    const options = {
      sort: {
        date: 1,
      },
    }
    const result = await this.orderBakeryModel.aggregate([
      { $match: condition, },
      { $sort: { date: 1, }, },
      {
        $lookup: {
          from: 'order',
          localField: 'order_id',
          foreignField: '_id',
          as: 'order',
        },
      },
      {
        $set: {
          order: {
            $first: '$order',
          },
        },
      },
    ]);
    return result;
  }

  async createMany(order) {
    let orderBakeryListMap: any = {};


    order.product_list.forEach((product: any) => {
      if (product.is_baked || product.is_baked_associated_item) {
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
            created_date: order.created_date,
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
      const model = new this.orderBakeryModel(orderBakeryList[i]);
      let result = await this.save(model, this.collectionName);
    }
  }
}