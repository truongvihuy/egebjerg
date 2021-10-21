import { Controller, Get, Post, Put, Delete, Param, Query, Request, ForbiddenException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { checkPermission } from '../helper/general.helper';

const collection = 'notification';
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) { }
  @Get()
  get(@Request() req) {
    return this.notificationService.findAll(req.user);
  }

  @Put('/:_id')
  update(@Request() req, @Param('_id') _id: number) {
    _id = +_id;
    return this.notificationService.update(_id, req.body, req.user);
  }

  // @Delete('/:_id')
  // delete(@Request() req, @Param('_id') _id: number) {
  //   if (checkPermission('delete', collection, req.user)) {
  //     _id = +_id;
  //     return this.notificationService.delete(_id);
  //   }
  //   throw new ForbiddenException('Forbidden');
  // }
}