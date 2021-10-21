import { Controller, Get, Post, Put, Delete, Param, Query, Request, ForbiddenException } from '@nestjs/common';
import { MunicipalityService } from './municipality.service'
import { checkPermission } from '../helper/general.helper'

@Controller('municipalities')
export class MunicipalityController {
  constructor(private municipalityService: MunicipalityService) { }

  @Get()
  get(@Request() req, @Query() query) {
    if (checkPermission('get', 'municipality', req.user)) {
      return this.municipalityService.findAll(query);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', 'municipality', req.user)) {
      return this.municipalityService.create(req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/:_id')
  update(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('update', 'municipality', req.user)) {
      _id = +_id;
      return this.municipalityService.update(_id, req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete('/:_id')
  delete(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('delete', 'municipality', req.user)) {
      _id = +_id;
      return this.municipalityService.delete(_id);
    }
    throw new ForbiddenException('Forbidden');
  }
}
