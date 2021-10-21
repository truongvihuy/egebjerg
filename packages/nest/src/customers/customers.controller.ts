import { Controller, Get, Post, Put, Delete, Param, UseGuards, Request, ForbiddenException, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CustomersService } from './customers.service'
import { checkPermission } from '../helper/general.helper'
import { USER_GROUP_ADMIN } from '../config/constants';
@Controller('customers')
export class CustomersController {

  constructor(private customersService: CustomersService) { }

  @Get()
  getAll(@Request() req, @Query() query) {
    if (checkPermission('get', 'customer', req.user)) {
      return this.customersService.get(query);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('/:_id')
  getById(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('get', 'customer', req.user)) {
      _id = +_id;
      return this.customersService.findById(_id);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('/:_id/cart')
  getCart(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('get', 'customer', req.user)) {
      _id = +_id
      return this.customersService.getCart(_id);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/:_id/cart_multi')
  updateCartMulti(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('update', 'customer', req.user)) {
      _id = +_id;
      return this.customersService.updateCartMulti(_id, req.body.product_list, req.body.note);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete('/:_id/cart')
  cleanCart(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('update', 'customer', req.user)) {
      _id = +_id
      return this.customersService.cleanCart(_id);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('/type/:type')
  getByUserGroupId(@Request() req, @Param() params) {
    if (checkPermission('get', 'customer', req.user)) {
      return this.customersService.findByCondition({ type: params.type });
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', 'customer', req.user)) {
      return this.customersService.create(req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put(':_id')
  update(@Request() req, @Param() param) {
    if (checkPermission('update', 'customer', req.user)) {
      let data = { ...req.body };
      delete data.customer_list;
      delete data.manage_by;
      delete data.username;
      delete data.password;
      return this.customersService.update(+param._id, req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/:_id/special')
  updateSpecial(@Request() req, @Param() param) {
    if (req.user.user_group_id == USER_GROUP_ADMIN) {
      return this.customersService.update(+param._id, req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/:_id/wallet')
  updateWallet(@Request() req, @Param() param) {
    if (req.user.user_group_id == USER_GROUP_ADMIN) {
      return this.customersService.updateWallet(+param._id, req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete(':_id')
  delete(@Request() req, @Param() param) {
    if (checkPermission('delete', 'customer', req.user)) {
      return this.customersService.delete(+param._id);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get(':_id/transactions/:type')
  getTransaction(@Request() req, @Param() param, @Query() query) {
    if (checkPermission('get', 'customer', req.user)) {
      return this.customersService.getTransaction(+param._id, +param.type, query);
    }
    throw new ForbiddenException('Forbidden');
  }
}
