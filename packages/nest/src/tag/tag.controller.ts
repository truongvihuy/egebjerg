import { Controller, Get, Post, Put, Delete, Param, Query, Request, ForbiddenException } from '@nestjs/common';
import { TagService } from './tag.service';
import { checkPermission } from '../helper/general.helper';

const collection = 'tag';
@Controller('tags')
export class TagController {
  constructor(private tagService: TagService) { }

  @Get()
  get(@Request() req, @Query() query) {
    if (checkPermission('get', collection, req.user)) {
      return this.tagService.find(query);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('/all')
  getAll(@Request() req) {
    if (checkPermission('get', collection, req.user)) {
      return this.tagService.findAll();
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', collection, req.user)) {
      return this.tagService.create(req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/:_id')
  update(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('update', collection, req.user)) {
      _id = +_id;
      return this.tagService.update(_id, req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete('/:_id')
  delete(@Request() req, @Param('_id') _id: number) {
    if (checkPermission('delete', collection, req.user)) {
      _id = +_id;
      return this.tagService.delete(_id);
    }
    throw new ForbiddenException('Forbidden');
  }
}
