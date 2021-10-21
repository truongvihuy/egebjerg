import { Controller, Get, Post, Put, Delete, Param, Query, Request, ForbiddenException, Response } from '@nestjs/common';
import { TaskService } from './task.service';
import { checkPermission } from '../helper/general.helper';

const collection = 'task';
@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) { }

  @Get()
  get(@Request() req, @Query() query) {
    if (checkPermission('get', collection, req.user)) {
      return this.taskService.find(query);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('insert', collection, req.user)) {
      return this.taskService.create(req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put(':_id')
  update(@Request() req, @Param('_id') _id) {
    if (checkPermission('update', collection, req.user)) {
      _id = +_id;
      return this.taskService.update(_id, req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('/log/:filename')
  getLog(@Request() req, @Param('filename') filename: string, @Response() res) {
    if (checkPermission('get', collection, req.user)) {
      return this.taskService.getLog(filename, res);
    }
    throw new ForbiddenException('Forbidden');
  }
}
