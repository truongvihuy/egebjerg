import { Controller, Delete, Get, Param, Post, Put, Request, ForbiddenException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { checkPermission } from '../helper/general.helper'

@Controller('categories')
export class CategoryController {
  constructor(private categoriesService: CategoryService) { }

  @Get()
  findAll(@Request() req): object {
    if (checkPermission('get', 'category', req.user)) {
      return this.categoriesService.findAll();
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('/tree/:_id')
  getTreeByCategoryId(@Request() req, @Param() param): object {
    if (checkPermission('get', 'category', req.user)) {
      return this.categoriesService.getTreeByCategoryId(param._id);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get(':_id')
  findById(@Request() req, @Param() param): object {
    if (checkPermission('get', 'category', req.user)) {
      return this.categoriesService.findById(param._id);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/:_id')
  updateOne(@Request() req): object {
    if (checkPermission('update', 'category', req.user)) {
      let data = {
        ...req.body,
        _id: +req.params._id,
      };
      return this.categoriesService.updateOne(data, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put()
  updateMany(@Request() req): object {
    if (checkPermission('update', 'category', req.user)) {
      return this.categoriesService.updateList(req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', 'category', req.user)) {
      return this.categoriesService.create(req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete(':_id')
  delete(@Request() req, @Param() param) {
    if (checkPermission('delete', 'category', req.user)) {
      return this.categoriesService.delete(param._id, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }
}