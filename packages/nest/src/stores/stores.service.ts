import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Store } from './stores.schema';
import { StoreDTO } from './stores.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import BaseService from '../helper/base.service';
import { processProjection } from '../helper/mongo.helper';
import { CustomersService } from '../customers/customers.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class StoresService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    private customerService: CustomersService,
    @InjectModel('Stores') public readonly storeModel: Model<Store>
  ) {
    super(counterService, configService);
  }
  private readonly collectionName = 'store';

  async findAll(condition = null, projection: any = null): Promise<Store[]> {
    let aggregateList: any = [
      {
        '$sort': {
          '_id': 1
        }
      },
      {
        '$lookup': {
          'from': 'zip_code',
          'localField': 'zip_code_id',
          'foreignField': '_id',
          'as': 'zip_code_info',
        }
      },
      {
        '$set': {
          'zip_code_info': {
            '$arrayElemAt': ['$zip_code_info', 0]
          }
        }
      }
    ];
    if (condition) {
      aggregateList.unshift({
        '$match': condition
      })
    }
    if (projection) {
      aggregateList.push({
        '$project': projection
      })
    }
    let storeList = await this.storeModel.aggregate(aggregateList);
    return storeList;
  }

  async findById(_id): Promise<Store> {
    let aggregateList: any = [
      {
        '$match': {
          _id: parseInt(_id)
        }
      },
      {
        '$lookup': {
          'from': 'zip_code',
          'localField': 'zip_code_id',
          'foreignField': '_id',
          'as': 'zip_code_info',
        }
      },
      {
        '$set': {
          'zip_code_info': {
            '$arrayElemAt': ['$zip_code_info', 0]
          }
        }
      }
    ];
    let aggregateResponseList = await this.storeModel.aggregate(aggregateList);
    return aggregateResponseList[0];
  }

  async findOneByCondition(condition: any): Promise<Store> {
    return await this.storeModel.findOne(condition);
  }

  async update(_id: number, data): Promise<Store> {
    if (!!data._id) {
      delete data._id;
    }
    let store = await this.storeModel.findOne({ _id });
    if (store) {
      return await this.updateById(_id, data, this.storeModel);
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async create(store: StoreDTO) {
    const newItem = new this.storeModel({
      ...store
    });
    const result = await this.save(newItem, this.collectionName);
    if (result) { // Need to call findById to get zip_code info
      return this.findById(newItem._id);
    }
  }

  async delete(_id) {
    return await this.remove(_id, this.storeModel, this.collectionName, ['customer']);
  }

  async search(query) {
    let condition = {};
    let projection = null;
    for (const key in query) {
      if (key !== 'field' && query[key] !== null) {
        if (key != 'name') {
          throw new BadRequestException();
        }
        condition[key] = new RegExp(query[key], 'ui');
      } else {
        projection = processProjection(query['field'].split(','));
      }
    }
    return this.findAll(condition, projection);
  }
}