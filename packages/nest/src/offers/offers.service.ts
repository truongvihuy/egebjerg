import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Offers } from './offers.schema';
import { OffersDTO } from './offers.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { NewspapersService } from '../newspapers/newspapers.service';
import { getNow } from '../helper/time.helper';
import BaseService from '../helper/base.service';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
import { difference } from 'lodash';

@Injectable()
export class OffersService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    @Inject(forwardRef(() => NewspapersService)) private newspapersService: NewspapersService,
    private productService: ProductsService,
    @InjectModel('Offers') public readonly offerModel: Model<Offers>
  ) {
    super(counterService, configService);
  }

  private readonly colectionName = 'offer';

  async findAll(query): Promise<Offers[]> {
    let condition: any = {};
    if (query['_id[]']) {
      condition._id = {
        $in: Array.isArray(query['_id[]']) ? query['_id[]'].map(e => +e) : [+query['_id[]']],
      }
      return this.findByCondition(condition);
    } else {
      return [];
    }
  }

  async findOneByCondition(condition: any): Promise<Offers> {
    return await this.offerModel.findOne(condition);
  }

  async findByCondition(condition: any): Promise<Offers[]> {
    let pipeline = [
      {
        $match: condition
      },
      {
        $lookup: {
          from: 'product',
          localField: 'product_id_list',
          foreignField: '_id',
          as: 'product_list'
        }
      }
    ];
    return await this.offerModel.aggregate(pipeline);
  }

  async create(offer, user) {
    let newspaper = await this.newspapersService.findById(offer.newspaper_id);
    const newItem = new this.offerModel({
      date_create: getNow(),
      active: newspaper.active,
      ...offer
    });
    const result = await this.save(newItem, this.colectionName);
    if (newspaper.active && offer?.product_id_list.length > 0) {
      await this.productService.productsModel.updateMany({ _id: { $in: offer.product_id_list }, status: { $lt: 2 } }, { $inc: { status: 2 } });
      await this.productService.indexElastic(null, offer.product_id_list);
    }

    newspaper.offer_list.offer_id_list[offer.newspaper_page].push(result._id);
    newspaper.offer_list.product_id_list[offer.newspaper_page].push(...offer.product_id_list);
    await this.newspapersService.update(offer.newspaper_id, newspaper, user);

    return result;
  }

  async update(_id: number, data, user) {
    if (!!data._id) {
      delete data._id;
    }
    let offer: Offers = await this.offerModel.findOne({ _id });
    if (offer) {
      let newProductIdList = difference(data.product_id_list, offer.product_id_list);
      let deleteProductIdList = difference(offer.product_id_list, data.product_id_list);
      const res = await this.updateById(_id, data, this.offerModel);
      //update product
      if (offer.active) {
        await this.productService.productsModel.updateMany({ _id: { $in: newProductIdList }, status: { $lt: 2 } }, { $inc: { status: 2 } });
        let processDeleteProductIdList = [];
        if (deleteProductIdList.length > 0) {
          let otherOfferListHaveDeleteProductList = await this.offerModel.find({
            product_id_list: {
              $in: deleteProductIdList
            },
            active: true
          });
          if (otherOfferListHaveDeleteProductList.length > 0) {
            deleteProductIdList.forEach(deleteProductId => {
              otherOfferListHaveDeleteProductList.forEach(otherOffer => {
                if (!otherOffer.product_id_list.includes(deleteProductId)) {
                  processDeleteProductIdList.push(deleteProductId);
                }
              });
            });
          } else {
            processDeleteProductIdList = deleteProductIdList;
          }
          if (processDeleteProductIdList.length > 0) {
            await this.productService.productsModel.updateMany({ _id: { $in: processDeleteProductIdList }, status: { $gte: 2 } }, { $inc: { status: -2 } });
          }
        }
        await this.productService.indexElastic(null, newProductIdList.concat(processDeleteProductIdList));
      }

      // update offer_list in newspaper
      let newspaper = await this.newspapersService.findById(data.newspaper_id);
      // newspaper.offer_list.offer_id_list[data.newspaper_page] = newspaper.offer_list.offer_id_list[data.newspaper_page].filter(e => e != _id);
      let offerLisInPage = await this.offerModel.find({ _id: { '$in': newspaper.offer_list.offer_id_list[data.newspaper_page] } });
      newspaper.offer_list.product_id_list[data.newspaper_page] = offerLisInPage.reduce((list, e) => list.concat(e.product_id_list), [])
      await this.newspapersService.update(data.newspaper_id, newspaper, user);

      return res;
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async updateMulti(conditions, data) {
    let result = await this.offerModel.updateMany(conditions, {
      $set: data,
    });
    return result;
  }

  async delete(_id: number, data, user) {
    let offer: Offers = await this.offerModel.findOne({ _id });
    if (offer) {
      let result = await this.remove(_id, this.offerModel, this.colectionName);
      //update product
      if (offer.active && offer.product_id_list.length > 0) {
        let processDeleteProductIdList = [];
        let otherOfferListHaveDeleteProductList = await this.offerModel.find({
          product_id_list: {
            $in: offer.product_id_list
          },
          active: true
        });
        if (otherOfferListHaveDeleteProductList.length > 0) {
          offer.product_id_list.forEach(deleteProductId => {
            otherOfferListHaveDeleteProductList.forEach(otherOffer => {
              if (!otherOffer.product_id_list.includes(deleteProductId)) {
                processDeleteProductIdList.push(deleteProductId);
              }
            });
          });
        } else {
          processDeleteProductIdList = offer.product_id_list;
        }
        if (processDeleteProductIdList.length > 0) {
          await this.productService.productsModel.updateMany({ _id: { $in: processDeleteProductIdList }, status: { $gte: 2 } }, { $inc: { status: -2 } });
          await this.productService.indexElastic(null, processDeleteProductIdList)
        }
      }
      // update offer_list in newspaper
      let newspaper = await this.newspapersService.findById(data.newspaper_id);
      newspaper.offer_list.offer_id_list[data.newspaper_page] = newspaper.offer_list.offer_id_list[data.newspaper_page].filter(e => e != _id);
      let offerLisInPage = await this.offerModel.find({ _id: { $in: newspaper.offer_list.offer_id_list[data.newspaper_page] } });
      newspaper.offer_list.product_id_list[data.newspaper_page] = offerLisInPage.reduce((list, e) => list.concat(e.product_id_list), [])
      await this.newspapersService.update(data.newspaper_id, newspaper);
      return result;
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async deleteMany(filter) {
    return await this.offerModel.deleteMany(filter);
  }
}