import { Controller, Get, Post, Put, Delete, Param, Query, Request, ForbiddenException } from '@nestjs/common';
import { CityService } from './city.service';
import { checkPermission } from '../helper/general.helper';

const collection = 'city';
@Controller('cities')
export class CityController {
  constructor(private citiesService: CityService) { }

  @Get()
  get(@Request() req, @Query() query) {
    if (checkPermission('get', collection, req.user)) {
      return this.citiesService.find(query);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('/all')
  getAll(@Request() req, @Query() query) {
    if (checkPermission('get', collection, req.user)) {
      return this.citiesService.findAll(query);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('/municipalities/:municipality_id')
  getByMunicipalityId(@Request() req, @Param() param) {
    if (checkPermission('get', collection, req.user)) {
      return this.citiesService.findByCondition({ municipality_id: param.municipality_id });
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', collection, req.user)) {
      return this.citiesService.create(req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/:_id')
  update(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('update', collection, req.user)) {
      _id = +_id;
      return this.citiesService.update(_id, req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete('/:_id')
  delete(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('delete', collection, req.user)) {
      _id = +_id;
      return this.citiesService.delete(_id);
    }
    throw new ForbiddenException('Forbidden');
  }
}
