import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { USER_GROUP_ADMIN, USER_GROUP_STORE, USER_GROUP_STAFF, NOTIFICATION_STATUS, ORDER_STATUS } from '../config/constants';
import { Notification } from '../notification/notification.schema';
import { Order } from '../order/order.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel('Notification') private readonly notificationModel: Model<Notification>,
    @InjectModel('Order') private readonly orderModel: Model<Order>,
  ) {
  }

  async getNotification(user) {
    let condition: any = {
      status: {
        $ne: NOTIFICATION_STATUS.solved
      }
    };
    switch (user.user_group_id) {
      case USER_GROUP_ADMIN: {
        let response: any = {};
        condition.from_store = true;
        response.admin = await this.notificationModel.find(condition, { projection: 0 }, { sort: { _id: -1 } }).exec()
        condition.from_store = false;
        response.store = await this.notificationModel.aggregate([
          { $match: condition },
          { $sort: { store_id: 1, _id: -1 } },
          {
            $lookup: {
              from: 'store',
              localField: 'store_id',
              foreignField: '_id',
              as: 'store'
            }
          },
          {
            $set: {
              store: {
                $arrayElemAt: ['$store', 0]
              }
            }
          }
        ]).exec();
        return response;
      }
      case USER_GROUP_STAFF: {
        condition.from_store = true;
        return { admin: await this.notificationModel.find(condition, { projection: 0 }, { sort: { _id: -1 } }).exec() };
      }
      case USER_GROUP_STORE: {
        condition.from_store = false;
        condition.store_id = user.store_id;
        return { store: await this.notificationModel.find(condition, { projection: 0 }, { sort: { _id: -1 } }).exec() };
      }
      default: {
        throw new ForbiddenException('Forbidden');
      }
    }
  }

  async calculateStatusOrder(user) {
    let condition: any = {};
    switch (user.user_group_id) {
      case USER_GROUP_ADMIN: {
        break;
      }
      case USER_GROUP_STAFF: {
        break;
      }
      case USER_GROUP_STORE: {
        condition['store._id'] = user.store_id;
        break;
      }
      default: {
        throw new ForbiddenException('Forbidden');
      }
    }

    let response: any = {
      cardToPbsIssue: await this.orderModel.countDocuments({ ...condition, status: ORDER_STATUS.received, card_to_pbs: true }),
      received: await this.orderModel.countDocuments({ ...condition, status: ORDER_STATUS.received, card_to_pbs: { $ne: true } }),
      packedPaymentIssue: await this.orderModel.countDocuments({ ...condition, status: ORDER_STATUS.packedPaymentIssue }),
    };

    return response;
  }
}