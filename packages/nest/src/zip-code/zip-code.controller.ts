import { Controller, Get, Post, Put, Delete, Param, Request, ForbiddenException, Query } from '@nestjs/common';
import { ZipCodeService } from './zip-code.service'
import { checkPermission } from '../helper/general.helper'


@Controller('zip-codes')
export class ZipCodeController {
  constructor(private zipCodeService: ZipCodeService) { }

  @Get('/:_id')
  getOne(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('get', 'zip_code', req.user)) {
      _id = +_id;
      return this.zipCodeService.findOneByCondition({ _id });
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('')
  get(@Request() req, @Query() query) {
    if (checkPermission('get', 'zip_code', req.user)) {
      return this.zipCodeService.find(query);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', 'zip_code', req.user)) {
      return this.zipCodeService.create(req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/:_id')
  update(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('update', 'zip_code', req.user)) {
      _id = +_id;
      return this.zipCodeService.update(_id, req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete('/:_id')
  delete(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('delete', 'zip_code', req.user)) {
      _id = +_id;
      return this.zipCodeService.delete(_id);
    }
    throw new ForbiddenException('Forbidden');
  }
}