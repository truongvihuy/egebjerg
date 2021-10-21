import { Controller, Get, Post, Put, Delete, Param, Query, Request, ForbiddenException } from '@nestjs/common';
import { SettingService } from './setting.service';
import { checkPermission } from '../helper/general.helper';

@Controller('settings')
export class SettingController {
  constructor(private settingService: SettingService) { }
  @Get()
  get(@Request() req) {
    if (checkPermission('get', 'setting', req.user)) {
      return this.settingService.findAll();
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('/:key')
  getByKey(@Request() req, @Param('key') key) {
    // Do not need to check permission because setting is used in many module
    return this.settingService.findByKey(key);

    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', 'setting', req.user)) {
      return this.settingService.create(req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put(':_id')
  update(@Request() req, @Param('_id') _id) {
    if (checkPermission('update', 'setting', req.user)) {
      _id = +_id;
      return this.settingService.update(parseInt(_id), req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }
  @Put()
  updateMulti(@Request() req) {
    if (checkPermission('update', 'setting', req.user)) {
      return this.settingService.updateMulti(req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete(':_id')
  delete(@Request() req, @Param() param) {
    if (checkPermission('delete', 'setting', req.user)) {
      return this.settingService.delete(parseInt(param._id));
    }
    throw new ForbiddenException('Forbidden');
  }
}