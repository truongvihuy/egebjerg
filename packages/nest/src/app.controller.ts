import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { Public } from './helper/customDecorator';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(private appService: AppService) { }
  @Get('')
  get(@Request() req) {
    return "Bravo!";
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('config')
  getConfig() {
    return this.appService.getConfig();
  }
}