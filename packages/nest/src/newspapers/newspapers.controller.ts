import { Controller, Get, Post, Put, Delete, Param, Request, ForbiddenException } from '@nestjs/common';
import { NewspapersService } from './newspapers.service';
import { checkPermission } from '../helper/general.helper';

@Controller('newspapers')
export class NewspapersController {
  constructor(private newspapersService: NewspapersService) { }

  @Get()
  getAll(@Request() req) {
    if (checkPermission('get', 'newspaper', req.user)) {
      return this.newspapersService.findAll();
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', 'newspaper', req.user)) {
      return this.newspapersService.create(req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put(':_id')
  update(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('update', 'newspaper', req.user)) {
      _id = +_id;
      return this.newspapersService.update(_id, req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete(':_id')
  delete(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('delete', 'newspaper', req.user)) {
      _id = +_id;
      return this.newspapersService.delete(_id);
    }
    throw new ForbiddenException('Forbidden');
  }
}

