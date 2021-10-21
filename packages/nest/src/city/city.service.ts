import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { City } from './city.schema';
import { CityDTO } from './city.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { ZipCodeService } from '../zip-code/zip-code.service';
import { NUMBER_ROW_PER_PAGE } from '../config/constants';
import BaseService from '../helper/base.service';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CityService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    private zipCodeService: ZipCodeService,
    @InjectModel('City') private readonly cityModel: Model<City>,
    private cacheManager: CacheService
  ) {
    super(counterService, configService);
  }
  private readonly columns = ['_id', 'name'];
  private readonly collectionName = 'city';

  async findAll(query): Promise<City[]> {
    let cityList = await this.cacheManager.get('city_list');
    if (!cityList) {
      cityList = await this.cityModel.find({}, { projection: 0 }, { sort: { name: 1 } }).exec();
      await this.cacheManager.set('city_list', cityList);
    }
    return cityList;
  }

  async find(query) {
    if (!!query._id) {
      return {
        city_list: await this.cityModel.find({ _id: parseInt(query._id) }, { projection: 0 }, { limit: 1 }).exec()
      }
    }
    let { limit = NUMBER_ROW_PER_PAGE, page = 1, field } = query;
    page = +page; limit = +limit

    let columns = field ? query.field.split(',') : this.columns;

    let condition = {};
    for (const key in query) {
      switch (key) {
        case 'page':
        case 'limit':
        case 'field': break;
        case 'municipality_id': condition[key] = query[key]; break;
        default: {
          if (this.columns.includes(key)) {
            condition[key] = new RegExp(query[key], 'ui');
          } else {
            throw new BadRequestException();
          }
        }
      }
    }

    let options = {
      sort: { name: 1 },
      limit,
      skip: (page - 1) * limit
    };

    let cityList = [];
    cityList = await this.cityModel.find(condition, columns, options).exec();
    if (page === 1) {
      const total = await this.cityModel.countDocuments(condition).exec();
      return {
        city_list: cityList,
        total,
      }
    }
    return {
      city_list: cityList,
    };
  }

  async findByCondition(condition: any): Promise<City[]> {
    return await this.cityModel.find(condition);
  }

  async findOneByCondition(condition: any): Promise<City> {
    return await this.cityModel.findOne(condition);
  }

  async create(city: CityDTO) {
    const model = new this.cityModel({
      ...city,
    });

    return this.save(model, this.collectionName);
  }

  async update(_id: number, data) {
    if (!!data._id) {
      delete data._id;
    }
    let city = await this.cityModel.findOne({ _id });
    if (city && data.name !== city.name) {
      const res = await this.updateById(_id, data, this.cityModel);

      await this.zipCodeService.updateMulti({ city_id: _id }, { city_name: data.name });
      if (res) {
        await this.cacheManager.del('city_list');
      }
      return res;
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async updateMulti(condition, dataUpdate) {
    let res = await this.cityModel.updateMany({
      filter: condition,
      update: dataUpdate
    });
    if (res) {
      await this.cacheManager.del('city_list');
    }
  }

  async delete(_id: number) {
    let res = await this.remove(_id, this.cityModel, this.collectionName, ['zip_code']);
    if (res) {
      await this.cacheManager.del('city_list');
    }
    return res;
  }
}