import { Injectable, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Newspapers } from './newspapers.schema';
import { NewspapersDTO } from './newspapers.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { ThumborService } from '../thumbor/thumbor.service';
import { OffersService } from '../offers/offers.service';
import { getNow } from '../helper/time.helper';
import BaseService from '../helper/base.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class NewspapersService extends BaseService {
  constructor(
    private thumborService: ThumborService,
    counterService: CounterService,
    configService: ConfigService,
    @Inject(forwardRef(() => OffersService)) private offerService: OffersService,
    @InjectModel('Newspapers') public readonly newspapersModel: Model<Newspapers>
  ) {
    super(counterService, configService);
  }
  private readonly columns = ['_id', 'name', 'offer_list', 'total_page', 'active', 'from', 'to', 'date_create'];
  private readonly colectionName = 'newspaper';

  async findAll(): Promise<Newspapers[]> {
    return this.newspapersModel.find({}, this.columns, { sort: { _id: -1 } }).exec();
  }

  async findById(id: number): Promise<Newspapers> {
    return await this.newspapersModel.findOne({ _id: id });
  }

  async create(newspaper: NewspapersDTO, user) {
    const newItem = new this.newspapersModel({
      date_create: getNow(),
      ...newspaper
    });

    return this.save(newItem, this.colectionName);
  }

  async update(_id: number, data, user = null) {
    if (!!data._id) {
      delete data._id;
    }
    const newspaper = await this.newspapersModel.findOne({ _id });
    if (newspaper) {
      const result = await this.updateById(_id, data, this.newspapersModel);

      // update image thumbor 
      // let insertImgList = [];
      let deletedImgList = [];
      let maxTotalPage = newspaper.total_page > result.total_page ? newspaper.total_page : result.total_page;
      for (let i = 0; i < maxTotalPage; i++) {
        let oldPage: any = newspaper.offer_list.img_list?.[i] ?? [];
        let newPage: any = result.offer_list.img_list?.[i] ?? [];
        if (oldPage?.uid !== newPage?.uid) {
          // if (newPage) {
          //   insertImgList.push(newPage.uid);
          // }
          if (oldPage) {
            deletedImgList.push(oldPage.uid);
          }
        }
      }
      if (deletedImgList.length) {
        await this.thumborService.deleteMany(deletedImgList);
      }
     
      // Update active in offer
      if (newspaper.active !== result.active) {
        let conditions = { newspaper_id: _id };
        await this.offerService.updateMulti(conditions, { active: result.active });
      }

      return result;
    }
    throw new BadRequestException('Ingen Kommuner fundet');
  }

  async delete(_id: number) {
    let newspaper = await this.findById(_id);
    let result = await this.remove(_id, this.newspapersModel, this.colectionName);
    if (newspaper) {
      // remove image in newspaper 
      let deletedImgList = [];
      newspaper.offer_list.img_list?.forEach((e: any) => {
        if (e) {
          deletedImgList.push(e.uid);
        }
      });
      await this.thumborService.deleteMany(deletedImgList);
      // remove all offers belonging to newspaper
      await this.offerService.deleteMany({ newspaper_id: _id });
    }
    return result;
  }
}
