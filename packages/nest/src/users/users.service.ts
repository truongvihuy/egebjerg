import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
import { UserDTO } from './users.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import * as bcrypt from 'bcrypt';
import { getNow } from '../helper/general.helper';
import BaseService from '../helper/base.service';
import { ConfigService } from '@nestjs/config';
import { processProjection } from '../helper/mongo.helper';
@Injectable()
export class UsersService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    @InjectModel('User') private readonly userModel: Model<User>
  ) {
    super(counterService, configService);
  }
  private readonly collectionName = 'user';

  async findAll(field = null, userGroupIdList = null): Promise<User[]> {
    let condition = {};
    if (userGroupIdList) {
      condition = {
        user_group_id: { $in: userGroupIdList.map(x => +x) }
      }
    }
    let projection: any = {
      password: 0
    };
    if (field) {
      projection = processProjection(field.split(','));
    }
    let userList = await this.userModel.aggregate([
      {
        $match: condition
      },
      {
        $lookup: {
          from: 'user_group',
          localField: 'user_group_id',
          foreignField: '_id',
          as: 'user_group',
        }
      },
      {
        $sort: {
          user_group_id: 1,
          _id: 1,
        }
      },
      {
        $set: {
          user_group: {
            $arrayElemAt: ['$user_group', 0]
          }
        }
      },
      {
        $set: {
          user_group_name: '$user_group.name'
        }
      },
      {
        $project: projection
      }
    ]);
    return userList;
  }

  async findById(id: number): Promise<User> {
    let userList = await this.userModel.aggregate([
      {
        $match: {
          _id: parseInt(id.toString())
        }
      },
      {
        $project: {
          password: 0
        }
      },
      {
        $lookup: {
          from: 'user_group',
          localField: 'user_group_id',
          foreignField: '_id',
          as: 'user_group',
        }
      },
      {
        $set: {
          user_group: {
            $arrayElemAt: ['$user_group', 0]
          }
        }
      },
      {
        $set: {
          user_group_name: '$user_group.name'
        }
      }
    ]);
    return userList[0];
    // return await this.userModel.findOne({ _id: id });
  }

  async findByCondition(condition: any): Promise<User[]> {
    return await this.userModel.find(condition);
  }

  async findOne(conditions: object, projection: object | null = null): Promise<User | undefined> {
    if (projection) {
      return this.userModel.findOne(conditions, projection);
    } else {
      return this.userModel.findOne(conditions);
    }
  }

  async create(user: UserDTO, currentUser) {
    const newItem = new this.userModel({
      ...user,
      username: user.username.trim(),
      password: await bcrypt.hash(user.password, 12),
      date_create: getNow(),
      date_update: null,
      user_create_id: currentUser._id,
    });
    let result = await this.save(newItem, this.collectionName);
    if (result) {
      return this.findById(result._id);
    }
  }

  async addRefreshToken(_id: number, refreshToken: string, expires: number): Promise<any> {
    let setObject = {};
    setObject['session.' + refreshToken] = expires;
    const test = await this.userModel.updateOne({ _id }, {
      $set: setObject
    });
    return true;
  }

  async removeRefreshToken(refreshToken: string): Promise<any> {
    let condition = {};
    condition['session.' + refreshToken] = {
      $ne: null
    };
    let unsetObject = {};
    unsetObject['session.' + refreshToken] = 1;
    const test = await this.userModel.updateOne(condition, {
      $unset: unsetObject
    });
    return true;
  }

  async update(_id, data, currentUser) {
    if (!!data._id) {
      delete data._id;
    }
    console.log(data);
    let user: any = await this.findOne({ _id });

    let dataUpdate = {
      ...user._doc,
      user_update_id: currentUser._id,
      date_update: getNow(),
    };
    if (!!data.password) {
      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        dataUpdate.password = await bcrypt.hash(data.password, 12);
        dataUpdate.session = {};
      } else {
        throw new ForbiddenException('Samme med gamle adgangskoder'); //Same with old password
      }
    } else {
      data.password = user.password;
      if (!!data.username) {
        data.username = data.username.trim();
      }
      dataUpdate = {
        ...dataUpdate,
        ...data
      };
    }
    let result = await this.updateById(_id, dataUpdate, this.userModel);
    if (result) {
      return this.findById(_id);
    }
  }

  async updateSetting(user, setting) {
    let data = {
      '$set': {}
    };

    Object.keys(setting).forEach(key => {
      data['$set'][`setting.${key}`] = setting[key]
    });

    await this.updateById(user._id, data, this.userModel);
    return {
      success: true
    }
  }

  async delete(_id) {
    return this.remove(_id, this.userModel, this.collectionName);
  }
  async changePassword(data, user) {
    let userDb: any = await this.userModel.findOne({ _id: user._id });
    const isMatch = await bcrypt.compare(data.old_password, userDb.password);
    console.log(isMatch)
    if (isMatch) {
      const test = await this.userModel.updateOne({ _id: user._id }, {
        $set: {
          password: await bcrypt.hash(data.new_password, 12),
        }
      });
      return {
        success: true
      }
    } else {
      throw new BadRequestException();
    }
  }
}