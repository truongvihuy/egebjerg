import { Controller, Get, Post, Put, Delete, Param, UseGuards, Request, HttpException, HttpStatus, Query, ForbiddenException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { checkPermission } from '../helper/general.helper';

const collection = 'report';
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) { }

  @Get('/overweight')
  reportOverweight(@Request() req, @Query() query) {
    if (checkPermission('get', collection, req.user)) {
      return this.reportsService.reportOverWeight(query);
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Get('/order-bakery')
  reportOrderBakery(@Request() req, @Query() query) {
    if (checkPermission('get', collection, req.user)) {
      return this.reportsService.reportOrderBakery(query);
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

}

