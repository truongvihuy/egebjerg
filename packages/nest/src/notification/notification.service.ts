import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './notification.schema';
import { CounterService } from '../counter/counter.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { StoresService } from '../stores/stores.service';
import BaseService from '../helper/base.service';
import { Model } from 'mongoose';
import { NotificationDTO } from './notification.dto';
import { USER_GROUP_ADMIN, USER_GROUP_STORE, USER_GROUP_STAFF, NOTIFICATION_STATUS } from '../config/constants';
import { getNow } from '../helper/time.helper';
const collection = 'notification';
const subjectNoticeStore = '[Egebjerg] You got a notification';

@Injectable()
export class NotificationService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    private mailService: MailService,
    private storeService: StoresService,
    @InjectModel('Notification') private readonly notificationModel: Model<Notification>,
  ) {
    super(counterService, configService);
  }

  async findAll(user): Promise<Notification[]> {
    let condition: any = {
      status: {
        $ne: NOTIFICATION_STATUS.solved
      }
    };
    if ([USER_GROUP_ADMIN, USER_GROUP_STAFF].includes(user.user_group_id)) {
      condition.from_store = true;
    } else if (user.user_group_id == USER_GROUP_STORE) {
      condition.from_store = false;
      condition.store_id = user.store_id;
    } else {
      throw new ForbiddenException('Forbidden');
    }
    return await this.notificationModel.find(condition, { projection: 0 }, { sort: { _id: -1 } }).exec();
  }

  async create(notification: NotificationDTO) {
    const newNotification = new this.notificationModel({
      ...notification,
    });

    const result = await this.save(newNotification, collection);
    if (result && newNotification.from_store === false) {
      let store = await this.storeService.findById(newNotification.store_id);
      await this.mailService.sendMail(subjectNoticeStore, { text: newNotification.message }, [store.email]);
    }
    return result;
  }

  async update(_id: number, data, user) {
    if (!!data._id) {
      delete data._id;
    }
    let condition: any = { _id };
    if ([USER_GROUP_ADMIN, USER_GROUP_STAFF].includes(user.user_group_id)) {
      condition.from_store = true;
    } else if (user.user_group_id == USER_GROUP_STORE) {
      condition.from_store = false;
      condition.store_id = user.store_id;
    }
    let notification = await this.notificationModel.findOne(condition);
    if (notification) {
      data.user_update = {
        _id: user._id,
        name: user.name,
        date: getNow()
      }
      const result = this.updateById(_id, data, this.notificationModel);
      return result;
    }
    throw new BadRequestException('Ingen By fundet');
  }


  async delete(_id: number) {
    let notification = await this.notificationModel.findOne({ _id });
    if (notification) {
      return this.remove(_id, this.notificationModel, collection, ['product'])
    }
    throw new BadRequestException('Ingen By fundet');
  }
}