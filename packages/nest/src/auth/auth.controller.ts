import { Controller, Get, Request, Response, Post, UseGuards, HttpStatus, UnauthorizedException, BadRequestException, Put } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BasicAuthGuard } from './basic-auth.guard';
import { AuthService } from './auth.service';
import { Public } from '../helper/customDecorator';
import { FastifyReply } from 'fastify';
import { addHours } from 'date-fns';
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) { }

  @Post('login')
  @Public()
  @UseGuards(BasicAuthGuard)
  async login(@Request() req, @Response() res: FastifyReply) {
    const token = await this.authService.login(req.user);
    res.setCookie('refresh_token', token.refresh_token, {
      expires: addHours(new Date(), this.configService.get<number>('refreshToken.exp')),
      sameSite: 'strict',
      httpOnly: true,
      path: '/'
    });
    res.code(HttpStatus.OK).send({ access_token: token.access_token });
  }

  @Post('refresh-token')
  @Public()
  async refreshToken(@Request() req, @Response() res: FastifyReply) {
    if (!!req.cookies.refresh_token) {
      const token = await this.authService.login(req);
      res.send({ access_token: token.access_token });
    } else {
      this.authService.clearRefreshTokenCookie(res);
      throw new UnauthorizedException('Forbidden');
    }
  }

  @Post('logout')
  @Public()
  async logout(@Request() req, @Response() res: FastifyReply) {
    if (!!req.cookies.refresh_token) {
      await this.authService.logout(req);
      this.authService.clearRefreshTokenCookie(res);
      res.code(HttpStatus.OK).send();
    } else {
      throw new BadRequestException('Forbidden - Bad request');
    }
  }

  @Get('access_token')
  getAccessToken(@Request() req) {
    return null;
  }
}
