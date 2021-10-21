import { Controller, Get, Param, UseGuards, Request, UnauthorizedException, Query, Post, Put, HttpException, HttpStatus, ForbiddenException, Response } from '@nestjs/common';
import { checkPermission } from '../helper/general.helper';
import { OrderService } from './order.service';
import {
  USER_GROUP_ADMIN,
  USER_GROUP_STORE,
  USER_GROUP_STAFF,
} from '../config/constants';
@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) { }

  @Get()
  findAll(@Request() req, @Query() query): object {
    if (checkPermission('get', 'order', req.user)) {
      return this.orderService.findAll(query, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get(':_id')
  async findById(@Request() req, @Param('_id') _id: number): Promise<object> {
    if (checkPermission('get', 'order', req.user)) {
      _id = +_id;
      const condition = { _id };
      if (req.user.user_group_id === 3) {
        if (req.user.store_id) {
          condition['store._id'] = req.user.store_id;
        } else {
          return null;
        }
      }
      let order = await this.orderService.findOneByCondition(condition);
      if (
        order &&
        (await this.orderService.checkOrderPermission(order, req.user))
      ) {
        return order;
      }
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get(':_id/packing-slip')
  async printOrder(@Request() req, @Param('_id') _id: number, @Response() res) {
    if (checkPermission('get', 'order', req.user)) {
      _id = +_id;
      res.headers({
        ...res.getHeaders(),
        'Content-type': "application/pdf",
      });
      let resultBase64 = await this.orderService.printPackingSlip(_id, req.user);
      res.send(resultBase64);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', 'order', req.user)) {
      return this.orderService.create(req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/:_id')
  update(@Request() req, @Param('_id') _id: number) {
    if (
      [USER_GROUP_ADMIN, USER_GROUP_STORE].includes(
        req.user.user_group_id,
      ) &&
      checkPermission('update', 'order', req.user)
    ) {
      _id = +_id;
      return this.orderService.update(_id, req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/payment-method/:_id')
  updatePaymentMethod(@Request() req, @Param('_id') _id: number) {
    if (
      [USER_GROUP_ADMIN, USER_GROUP_STAFF].includes(req.user.user_group_id) &&
      checkPermission('update', 'order', req.user)
    ) {
      _id = +_id;
      return this.orderService.updatePaymentMethod(_id, req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/overweight-rate/:_id')
  updateOverweightRate(@Request() req, @Param('_id') _id: number) {
    if (
      req.user.user_group_id === USER_GROUP_ADMIN &&
      checkPermission('update', 'order', req.user)
    ) {
      _id = +_id;
      return this.orderService.updateOverweightRate(_id, req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/claim-more/:_id')
  claimMoreOrder(@Request() req, @Param('_id') _id: number) {
    if (
      [USER_GROUP_ADMIN, USER_GROUP_STORE].includes(
        req.user.user_group_id,
      ) &&
      checkPermission('update', 'order', req.user)
    ) {
      _id = +_id;
      return this.orderService.claimMoreOrder(_id, req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/claim/:_id')
  claimOrder(@Request() req, @Param('_id') _id: number) {
    if (
      [USER_GROUP_ADMIN, USER_GROUP_STORE].includes(
        req.user.user_group_id,
      ) &&
      checkPermission('update', 'order', req.user)
    ) {
      _id = +_id;
      return this.orderService.claimOrder(_id, req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/refund/:_id')
  refundOrder(@Request() req, @Param('_id') _id: number) {
    if (
      [USER_GROUP_ADMIN, USER_GROUP_STORE].includes(
        req.user.user_group_id,
      ) &&
      checkPermission('update', 'order', req.user)
    ) {
      _id = +_id;
      return this.orderService.refundOrder(_id, req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }
}
