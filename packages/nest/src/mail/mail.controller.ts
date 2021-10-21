import { Controller, Get, Post, Put, Delete, Param, Query, Request, HttpException, HttpStatus } from '@nestjs/common';
import { MailService } from './mail.service';
import { checkPermission } from '../helper/general.helper';

@Controller('mails')
export class MailController {
  constructor(private mailService: MailService) { }
  @Get()
  get(@Request() req) {
    if (checkPermission('get', 'setting', req.user)) {
      return this.mailService.findAll();
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
  @Post('')
  async create(@Request() req) {
    if (checkPermission('insert', 'setting', req.user)) {
      return this.mailService.create(req.body);
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
  @Put(':_id')
  update(@Request() req, @Param('_id') _id) {
    if (checkPermission('update', 'setting', req.user)) {
      _id = +_id;
      return this.mailService.update(parseInt(_id), req.body);
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
  @Post('/sendmail')
  async sendMail(@Request() req) {
    if (checkPermission('send', 'setting', req.user)) {
      let data = req.body;
      if (await this.mailService.sendMail(data.subject, { text: data.content, isHTML: data.isHTML ?? true }, data.emailTo ?? null)) {
        throw new HttpException('OK', HttpStatus.OK);
      } else {
        throw new HttpException('FAIL', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
  @Post('/send-order')
  async sendOrderMail(@Request() req) {
    if (checkPermission('send', 'setting', req.user)) {
      let data = req.body;
      if (await this.mailService.sendOrderMail(data.order, data.emailTo ?? null)) {
        throw new HttpException('OK', HttpStatus.OK);
      } else {
        throw new HttpException('FAIL', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
}