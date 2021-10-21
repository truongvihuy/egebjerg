import { Controller, Get, Post, Put, Delete, Param, Request, ForbiddenException } from '@nestjs/common';
import { UserGroupsService } from './user-groups.service';
import { checkPermission } from '../helper/general.helper';
@Controller('user-groups')
export class UserGroupsController {
  constructor(private userGroupsService: UserGroupsService) { }

  @Get()
  getAll(@Request() req) {
    if (checkPermission('get', 'user_group', req.user)) {
      return this.userGroupsService.findAll();
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', 'user_group', req.user)) {
      return this.userGroupsService.create(req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put(':_id')
  update(@Request() req, @Param() param) {
    if (checkPermission('update', 'user_group', req.user)) {
      return this.userGroupsService.update(param._id, req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete(':_id')
  delete(@Request() req, @Param() param) {
    if (checkPermission('delete', 'user_group', req.user)) {
      return this.userGroupsService.delete(param._id);
    }
    throw new ForbiddenException('Forbidden');
  }
}
