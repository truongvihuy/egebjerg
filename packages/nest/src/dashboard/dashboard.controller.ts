import { Controller, Get, Post, Put, Delete, Param, Query, Request, ForbiddenException } from '@nestjs/common';
import { checkPermission } from '../helper/general.helper';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) { }
  @Get()
  async get(@Request() req) {
    if (checkPermission('get', 'order', req.user)) {
      return {
        notification: await this.dashboardService.getNotification(req.user),
        statusOrder: await this.dashboardService.calculateStatusOrder(req.user)
      }
    }
    throw new ForbiddenException('Forbidden');
  }
}