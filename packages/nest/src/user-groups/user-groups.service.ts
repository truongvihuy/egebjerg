import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserGroups } from './user-groups.schema';
import { UserGroupsDTO } from './user-groups.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { UsersService } from '../users/users.service';
import BaseService from '../helper/base.service';
import { ConfigService } from '@nestjs/config';
const INIT_USER_GROUP_LIST = [1, 2, 3];
const collection = 'user_group';
@Injectable()
export class UserGroupsService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    private userService: UsersService,
    @InjectModel('UserGroups') private readonly userGroupsModel: Model<UserGroups>
  ) {
    super(counterService, configService);
  }

  async findAll(): Promise<UserGroups[]> {
    return this.userGroupsModel.find().sort({ _id: 1 }).exec();
  }

  async findById(id: number): Promise<UserGroups> {
    return await this.userGroupsModel.findOne({ _id: id });
  }

  async create(userGroup: UserGroupsDTO) {
    const newItem = new this.userGroupsModel({
      ...userGroup
    });
    return this.save(newItem, collection);
  }

  async update(_id: number, data) {
    let userGroup = await this.userGroupsModel.findOne({ _id });
    if (userGroup) {
      return await this.updateById(_id, data, this.userGroupsModel);
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async delete(_id: number) {
    if (INIT_USER_GROUP_LIST.includes(_id)) {
      throw new BadRequestException('Kan ikke slette');
    }
    return await this.remove(_id, this.userGroupsModel, collection);
  }
}