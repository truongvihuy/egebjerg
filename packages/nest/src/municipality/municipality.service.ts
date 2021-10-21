import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Municipality } from './municipality.schema';
import { MunicipalityDTO } from './municipality.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { ZipCodeService } from '../zip-code/zip-code.service';
import { CityService } from '../city/city.service';
import BaseService from '../helper/base.service';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';
@Injectable()
export class MunicipalityService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    private zipCodeService: ZipCodeService,
    private cityService: CityService,
    @InjectModel('Municipality') private readonly municipalityModel: Model<Municipality>,
    private cacheManager: CacheService
  ) {
    super(counterService, configService)
  }
  private readonly columns = ['_id', 'name', 'weight_limit', 'overweight_price'];
  private readonly collectionName = 'municipality';

  async findAll(query): Promise<Municipality[]> {
    let columns = query.field ? query.field.split(',') : this.columns;
    let cacheKey = `municipality_list_${columns.join('_')}`;
    let municipalityList = await this.cacheManager.get(cacheKey);
    if (!municipalityList) {
      municipalityList = await this.municipalityModel.find({}, columns, { sort: { name: 1 } }).exec();
      await this.cacheManager.set(cacheKey, municipalityList);
    }
    return municipalityList;
  }

  async create(municipality: MunicipalityDTO) {
    const model = new this.municipalityModel({
      ...municipality,
    });

    let result = await this.save(model, this.collectionName);
    if (result) {
      await this.clearCache();
    }
    return result;
  }

  async update(_id: number, data) {
    if (!!data._id) {
      delete data._id;
    }
    let municipality = await this.municipalityModel.findOne({ _id });
    if (municipality) {
      const res = await this.updateById(_id, data, this.municipalityModel);


      if (data.name !== municipality.name) {
        await this.zipCodeService.updateMulti({ municipality_id: _id }, { municipality_name: data.name })
        await this.cityService.updateMulti({ municipality_id: _id }, { municipality_name: data.name })
      }
      if (res) {
        await this.clearCache();
      }
      return res;
    }
    throw new BadRequestException('Ingen Kommuner fundet');
  }

  async delete(_id: number) {
    let result = await this.remove(_id, this.municipalityModel, this.collectionName, ['zip_code']);
    if (result) {
      await this.clearCache();
    }
  }

  async clearCache() {
    let cacheKey = `municipality_list_${this.columns.join('_')}`;
    await this.cacheManager.del(cacheKey);
  }
}
