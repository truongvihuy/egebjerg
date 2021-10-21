import { Controller, Get, Post, Put, Delete, Param, Query, Request, ForbiddenException } from '@nestjs/common';
import { StoresService } from './stores.service';
import { checkPermission } from '../helper/general.helper';
@Controller('stores')
export class StoresController {
  constructor(private storeService: StoresService) { }

  @Get('/all')
  getAll(@Request() req) {
    if (checkPermission('get', 'store', req.user)) {
      return this.storeService.findAll();
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('/:id')
  getById(@Request() req, @Param() params) {
    if (checkPermission('get', 'store', req.user)) {
      return this.storeService.findById(params.id);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/:_id')
  update(@Request() req, @Param() param) {
    if (checkPermission('update', 'store', req.user)) {
      return this.storeService.update(param._id, req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', 'store', req.user)) {
      return this.storeService.create(req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete('/:_id')
  delete(@Request() req, @Param() param) {
    if (checkPermission('delete', 'store', req.user)) {
      return this.storeService.delete(param._id);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('')
  search(@Request() req, @Query() query) {
    if (checkPermission('get', 'zip_code', req.user)) {
      return this.storeService.search(query);
    }
    throw new ForbiddenException('Forbidden');
  }
}