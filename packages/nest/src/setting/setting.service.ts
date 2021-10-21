import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Setting } from './setting.schema';
import { SettingDTO } from './setting.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { getNow } from '../helper/general.helper';
import BaseService from '../helper/base.service';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';
const collection = 'setting';
@Injectable()
export class SettingService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    private cacheManager: CacheService,
    @InjectModel('Setting') private readonly settingModel: Model<Setting>
  ) {
    super(counterService, configService);
  }

  async findAll(): Promise<Setting[]> {
    let settingList = await this.cacheManager.get('setting_list');
    if (!settingList) {
      settingList = await this.settingModel.find().sort({ _id: 1 }).exec();
      await this.cacheManager.set('setting_list', settingList);
    }
    return settingList;
  }
  async findByKey(key: string): Promise<Setting> {
    return this.settingModel.findOne({ key }).exec();
  }

  async create(setting: SettingDTO, currentUser) {
    const newItem = new this.settingModel({
      ...setting,
      key: setting.key.trim(),
      name: setting.name.trim(),
      value: setting.value,
      date_create: getNow(),
      date_update: null,
      user_create_id: currentUser._id,
    });
    return this.save(newItem, collection);
  }

  async update(_id, data, currentUser) {
    if (!!data._id) {
      delete data._id;
    }
    let oldSetting: any = await this.settingModel.findOne({ _id });
    if (oldSetting) {
      let result =  this.updateById(_id, {
        ...oldSetting._doc,
        ...data,
        date_update: getNow(),
        user_update_id: currentUser._id,
      }, this.settingModel);
      if(result){
        await this.cacheManager.del('setting_list');
      }
      return result;
    }
    throw new BadRequestException('Ingen By fundet');
  }
  async updateMulti(settingList, currentUser) {
    for (let i = 0; i < settingList.length; i++) {
      let setting = { ...settingList[i] };
      let _id = setting._id;
      delete setting._id;
      await this.updateById(_id, {
        ...setting,
        date_update: getNow(),
        user_update_id: currentUser._id,
      }, this.settingModel);
    }
    await this.cacheManager.del('setting_list');
    return settingList;
  }

  async delete(_id: number) {
    this.remove(_id, this.settingModel, collection)
    await this.cacheManager.del('setting_list');
  }

  async getPbsSetting() {
    return await this.settingModel.findOne({ key: 'pbs_settings' });
  }
}
