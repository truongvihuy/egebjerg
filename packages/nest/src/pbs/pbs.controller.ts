import { Controller, Get, Post, Put, Delete, Param, Query, Request, Response, ForbiddenException, Header } from '@nestjs/common';
import { Response as Res } from 'express';
import { PBSService } from './pbs.service';
import { checkPermission } from '../helper/general.helper';

@Controller('pbs')
export class PBSController {
  constructor(private pbsService: PBSService) { }
  @Get()
  get(@Request() req, @Query() query) {
    if (checkPermission('get', 'pbs', req.user)) {
      return this.pbsService.findAll(query);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('/:key')
  getByKey(@Request() req, @Param('key') key) {
    if (checkPermission('get', 'pbs', req.user)) {
      return this.pbsService.findByKey(key);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post()
  create(@Request() req) {
    if (checkPermission('add', 'pbs', req.user)) {
      return this.pbsService.create(req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put(':_id')
  update(@Request() req, @Param('_id') _id) {
    if (checkPermission('update', 'pbs', req.user)) {
      _id = +_id;
      return this.pbsService.update(parseInt(_id), req.body, req.user);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Put('/submit')
  submitPbs(@Request() req) {
    if (checkPermission('update', 'pbs', req.user)) {
      return this.pbsService.submit(req.body);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Delete(':_id')
  delete(@Request() req, @Param() param) {
    if (checkPermission('delete', 'pbs', req.user)) {
      return this.pbsService.delete(parseInt(param._id));
    }
    throw new ForbiddenException('Forbidden');
  }

  @Post('/generate')
  generate(@Request() req) {
    if (checkPermission('full', 'pbs', req.user)) {
      return this.pbsService.generate(req.body);
    }
    throw new ForbiddenException('Forbidden');
  }
  @Get('/download/:fileName')
  download(@Request() req, @Response() res, @Param('fileName') fileName: string) {
    if (checkPermission('full', 'pbs', req.user)) {
      return this.pbsService.download(fileName, res);
    }
    throw new ForbiddenException('Forbidden');
  }

  @Get('/view/:fileName')
  viewPbs(@Request() req, @Param('fileName') fileName: string, @Response() res) {
    if (checkPermission('get', 'pbs', req.user)) {
      return this.pbsService.viewPbs(fileName, res);
    }
    throw new ForbiddenException('Forbidden');
  }
}