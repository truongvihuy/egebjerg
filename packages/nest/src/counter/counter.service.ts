import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Counter } from './counter.schema';
import { CounterDTO } from './counter.dto';
import { Model } from 'mongoose';

@Injectable()
export class CounterService {
  constructor(@InjectModel('Counter') public readonly counterModel: Model<Counter>) { }

  async getMaxIdByCounter(_id: string) {
    const counter = await this.counterModel.findOne({ _id });
    if (counter) {
      return counter.max_id + 1;
    } else {
      const newCounter = new this.counterModel({
        _id,
        max_id: 0,
        total: 0
      });
      await newCounter.save();
      return 1;
    }
  }

  async getTotal(collectionName) {
    const counter = await this.counterModel.findOne({ _id: collectionName });
    if (counter) {
      return counter.total;
    }

    return null;
  }

  //_id ~~ collectionName
  async increaseCounter(_id: string, inc = 1) {
    const counter = await this.counterModel.updateOne({ _id }, {
      '$inc': {
        max_id: inc,
        total: inc
      }
    });
  }
}