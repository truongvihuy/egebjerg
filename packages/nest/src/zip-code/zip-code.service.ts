import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ZipCode } from './zip-code.schema';
import { ZipCodeDTO } from './zip-code.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { CustomersService } from '../customers/customers.service';
import { StoresService } from '../stores/stores.service';
import { NUMBER_ROW_PER_PAGE } from '../config/constants';
import BaseService from '../helper/base.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ZipCodeService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    private customerService: CustomersService,
    private storeService: StoresService,
    @InjectModel('ZipCode') private readonly zipCodeModel: Model<ZipCode>
  ) {
    super(counterService, configService);
  }
  private readonly columns = ['_id', 'zip_code', 'city_name', 'city_id', 'municipality_name', 'municipality_id'];
  private readonly collectionName = 'zip_code';

  async find(query) {
    if (!!query._id) {
      if (query._id == 'null') {
        return {
          zip_code_list: []
        };
      } else {
        return {
          zip_code_list: await this.zipCodeModel.find({ _id: parseInt(query._id) }, { projection: 0 }, { limit: 1 })
        }
      }
    }
    let { limit = NUMBER_ROW_PER_PAGE, page = 1, field } = query;
    limit = +limit; page = +page;

    let columns = field ? query.field.split(',') : this.columns;

    let condition = {};
    for (const key in query) {
      switch (key) {
        case 'page':
        case 'field':
        case 'limit': break;
        case 'zip_code': {
          condition['$expr'] = {
            '$regexMatch': {
              'input': { '$toString': '$zip_code' },
              'regex': new RegExp(query[key], 'ui')
            }
          };
          break;
        }
        case 'city_id':
        case 'municipality_id': condition[key] = +query[key]; break;
        default: {
          if (!this.columns.includes(key)) {
            throw new BadRequestException();
          }
          condition[key] = new RegExp(query[key], 'ui');
        }
      }
    }

    let option = {
      sort: { zip_code: 1 },
      limit,
      skip: limit * (page - 1),
    };

    const zipCodeList = await this.zipCodeModel.find(condition, columns, option).exec();
    if (page === 1) {
      const total = await this.zipCodeModel.countDocuments(condition).exec();
      return {
        zip_code_list: zipCodeList,
        total
      }
    }
    return {
      zip_code_list: zipCodeList
    }
  }

  async findByCondition(condition: any): Promise<ZipCode[]> {
    return await this.zipCodeModel.find(condition);
  }

  async findOneByCondition(condition: any): Promise<ZipCode> {
    return await this.zipCodeModel.findOne(condition);
  }

  async create(zipCode: ZipCodeDTO) {
    const model = new this.zipCodeModel({
      ...zipCode
    });

    return this.save(model, this.collectionName);
  }

  async update(_id: number, data) {
    if (!!data._id) {
      delete data._id;
    }
    let zipCode = await this.zipCodeModel.findOne({ _id });
    if (zipCode) {
      return await this.updateById(_id, data, this.zipCodeModel);
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async updateMulti(condition, dataUpdate) {
    return await this.zipCodeModel.updateMany(condition, dataUpdate);
  }

  async delete(_id: number) {
    return await this.remove(_id, this.zipCodeModel, this.collectionName, ['customer', 'store']);
  }
}
