import { Controller, Get, Post, Put, Delete, Param, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { checkPermission } from '../helper/general.helper'
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get()
  findAll(@Request() req, @Query('field') field: string, @Query('user_group_id[]') user_group_id: number[]): object {
    if (checkPermission('get', 'user', req.user)) {
      return this.usersService.findAll(field, user_group_id);
    }
    throw new ForbiddenException('Forbidden');
  }
  @Get(':id')
  findById(@Param() param): object {
    return this.usersService.findById(param.id);
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', 'user', req.user) && checkPermission('add', 'user_group', req.user)) {
      return this.usersService.create(req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put(':_id')
  update(@Request() req, @Param() param) {
    if (checkPermission('update', 'user', req.user)) {
      return this.usersService.update(param._id, req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete(':_id')
  delete(@Request() req, @Param() param) {
    if (checkPermission('delete', 'user', req.user)) {
      return this.usersService.delete(param._id);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/setting')
  updateSetting(@Request() req) {
    return this.usersService.updateSetting(req.user, req.body);
  }

  @Put()
  changePassword(@Request() req) {
    return this.usersService.changePassword(req.body, req.user);
  }
}