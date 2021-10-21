import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from './brand.schema';
import { BrandDTO } from './brand.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { NUMBER_ROW_PER_PAGE } from '../config/constants';
import BaseService from '../helper/base.service';
import { ProductsService } from '../products/products.service';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';
@Injectable()
export class BrandService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    private productService: ProductsService,
    private cacheManager: CacheService,
    @InjectModel('Brand') private readonly brandModel: Model<Brand>,
  ) {
    super(counterService, configService);
  }
  private readonly columns = ['_id', 'name'];
  private readonly collectionName = 'brand';

  async findAll(): Promise<Brand[]> {
    let brandList = await this.cacheManager.get('brand_list');
    if (!brandList) {
      brandList = await this.brandModel.find({}, { projection: 0 }, { sort: { name: 1 } }).exec();
      await this.cacheManager.set('brand_list', brandList);
    }
    return brandList;
  }

  async find(query) {
    if (!!query._id) {
      return {
        brand_list: await this.brandModel.find({ _id: parseInt(query._id) }, { projection: 0 }, { limit: 1 }).exec()
      }
    }
    let { limit = NUMBER_ROW_PER_PAGE, page = 1, field } = query;
    page = +page; limit = +limit

    let columns = field ? query.field.split(',') : this.columns;

    let condition = {};
    for (const key in query) {
      switch (key) {
        case 'page':
        case 'field':
        case 'limit': break;
        default: {
          if (!this.columns.includes(key)) {
            throw new BadRequestException();
          }
          condition[key] = new RegExp(query[key], 'ui');
        }
      }
    }

    let options = {
      sort: { name: 1 },
      limit,
      skip: (page - 1) * limit
    };
    let brandList = [];
    brandList = await this.brandModel.find(condition, columns, options).exec();
    if (page === 1) {
      const total = await this.brandModel.countDocuments(condition).exec();
      return {
        brand_list: brandList,
        total,
      }
    }
    return {
      brand_list: brandList,
    };
  }

  async findByCondition(condition: any): Promise<Brand[]> {
    return await this.brandModel.find(condition);
  }

  async findOneByCondition(condition: any): Promise<Brand> {
    return await this.brandModel.findOne(condition);
  }

  async create(brand: BrandDTO) {
    const newBrand = new this.brandModel({
      ...brand,
    });

    const result = await this.save(newBrand, this.collectionName);
    if (result) {
      await this.cacheManager.del('brand_list');
    }
    return result;
  }

  async update(_id: number, data) {
    if (!!data._id) {
      delete data._id;
    }
    let brand = await this.brandModel.findOne({ _id });
    if (brand) {
      const result = this.updateById(_id, data, this.brandModel);
      if (result) {
        await this.cacheManager.del('brand_list');
      }
      return result;
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async updateMulti(condition, dataUpdate) {
    const result = await this.brandModel.updateMany({
      filter: condition,
      update: dataUpdate
    });
    if (result) {
      await this.cacheManager.del('brand_list');
    }
    return result;
  }

  async delete(_id: number) {
    let brand = await this.brandModel.findOne({ _id });
    if (brand) {
      const result = this.remove(_id, this.brandModel, this.collectionName, ['product'])
      if (result) {
        await this.cacheManager.del('brand_list');
      }
      return result;
    }
    throw new BadRequestException('Ingen By fundet');
  }
}