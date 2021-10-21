import { Controller, Get, Post, Put, Delete, Query, Param, Request, ForbiddenException } from '@nestjs/common';
import { OffersService } from './offers.service';
import { checkPermission } from '../helper/general.helper';

@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) { }

  @Get()
  findAll(@Request() req, @Query() query): object {
    if (checkPermission('get', 'newspaper', req.user)) {
      return this.offersService.findAll(query);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get(':_id')
  findById(@Request() req, @Param('_id') _id: number): object {
    if (checkPermission('get', 'newspaper', req.user)) {
      _id = +_id;
      return this.offersService.findOneByCondition({ _id });
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', 'newspaper', req.user)) {
      return this.offersService.create(req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put(':_id')
  update(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('update', 'newspaper', req.user)) {
      _id = +_id;
      return this.offersService.update(_id, req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete(':_id')
  delete(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('delete', 'newspaper', req.user)) {
      _id = +_id;
      return this.offersService.delete(_id, req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }
}