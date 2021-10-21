import { Controller, Get, Post, Put, Delete, Param, Query, Request, ForbiddenException } from '@nestjs/common';
import { BrandService } from './brand.service';
import { checkPermission } from '../helper/general.helper';

const collection = 'brand';
@Controller('brands')
export class BrandController {
  constructor(private brandService: BrandService) { }

  @Get()
  get(@Request() req, @Query() query) {
    if (checkPermission('get', collection, req.user)) {
      return this.brandService.find(query);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('/all')
  getAll(@Request() req) {
    if (checkPermission('get', collection, req.user)) {
      return this.brandService.findAll();
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', collection, req.user)) {
      return this.brandService.create(req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/:_id')
  update(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('update', collection, req.user)) {
      _id = +_id;
      return this.brandService.update(_id, req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete('/:_id')
  delete(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('delete', collection, req.user)) {
      _id = +_id;
      return this.brandService.delete(_id);
    }
    throw new ForbiddenException('Forbidden');
  }
}
