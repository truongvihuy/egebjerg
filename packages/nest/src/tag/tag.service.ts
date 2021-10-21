import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tag } from './tag.schema';
import { TagDTO } from './tag.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { ZipCodeService } from '../zip-code/zip-code.service';
import { NUMBER_ROW_PER_PAGE } from '../config/constants';
import BaseService from '../helper/base.service';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';
const collection = 'tag';
@Injectable()
export class TagService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    @InjectModel('Tag') private readonly tagModel: Model<Tag>,
    private cacheManager: CacheService
  ) {
    super(counterService, configService);
  }
  private readonly columns = ['_id', 'name'];

  async findAll(): Promise<Tag[]> {
    let tagList = await this.cacheManager.get('tag_list');
    if (!tagList) {
      tagList = await this.tagModel.find({}, { projection: 0 }, { sort: { name: 1 } }).exec();
      await this.cacheManager.set('tag_list', tagList);
    }
    return tagList;
  }

  async find(query) {
    if (!!query._id) {
      return {
        tag_list: await this.tagModel.find({ _id: parseInt(query._id) }, { projection: 0 }, { limit: 1 }).exec()
      }
    }
    let { limit = NUMBER_ROW_PER_PAGE, page = 1, field } = query;
    page = +page; limit = +limit

    let columns = field ? query.field.split(',') : this.columns;

    let condition = {};
    for (const key in query) {
      if (query[key] == null) {
        continue;
      }
      switch (key) {
        case 'page':
        case 'limit':
        case 'field': break;
        case 'id_list': {
          condition['_id'] = {
            $in: query[key].split(',').map(x => parseInt(x))
          };
          break;
        }
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
    let tagList = [];
    tagList = await this.tagModel.find(condition, columns, options).exec();

    if (page === 1) {
      const total = await this.tagModel.countDocuments(condition).exec();
      return {
        tag_list: tagList,
        total,
      }
    }
    return {
      tag_list: tagList,
    };
  }

  async findByCondition(condition: any): Promise<Tag[]> {
    return await this.tagModel.find(condition);
  }

  async findOneByCondition(condition: any): Promise<Tag> {
    return await this.tagModel.findOne(condition);
  }

  async create(tag: TagDTO) {
    const newTag = new this.tagModel({
      ...tag,
    });
    let result = await this.save(newTag, collection);
    if (result) {
      await this.cacheManager.del('tag_list');
    }
    return result;
  }

  async update(_id: number, data) {
    if (!!data._id) {
      delete data._id;
    }
    let tag = await this.tagModel.findOne({ _id });
    if (tag) {
      let result = await this.updateById(_id, data, this.tagModel)
      if (result) {
        await this.cacheManager.del('tag_list');
      }
      return result;
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async updateMulti(condition, dataUpdate) {
    let result = await this.tagModel.updateMany({
      filter: condition,
      update: dataUpdate
    });
    if (result) {
      await this.cacheManager.del('tag_list');
    }
    return result;
  }

  async delete(_id: number) {
    let tag = await this.tagModel.findOne({ _id });
    if (tag) {
      let result = this.remove(_id, this.tagModel, collection, null)
      if (result) {
        await this.cacheManager.del('tag_list');
      }
      return result;
    }
    throw new BadRequestException('Ingen By fundet');
  }
}