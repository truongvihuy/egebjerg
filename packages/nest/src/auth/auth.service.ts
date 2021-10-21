import { Injectable, UnauthorizedException, Response } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UserGroupsService } from '../user-groups/user-groups.service';
import { JwtService } from '@nestjs/jwt';
import { processProjection } from '../helper/mongo.helper';
import { getNow } from '../helper/time.helper';
import { getDeviceByUserAgent } from '../helper/general.helper';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto-js';
import { FastifyReply } from 'fastify';

export let newAccessToken = null;
export let newUser = null;
export const resetNewUser = () => {
  newAccessToken = false;
  newUser = false;
}
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private userGroupsService: UserGroupsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    let projectionList: any = processProjection(['name', 'username', 'user_group_id', 'setting', 'permission', 'store_id']);
    projectionList.password = 1;
    let user: any = await this.usersService.findOne({ username, active: true }, projectionList);
    if (user) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const userGroup = await this.userGroupsService.findById(user.user_group_id);
        delete user.password;
        user.permission = userGroup.permission;
        user.user_group_name = userGroup.name;

        return user;
      }
    }

    return null;
  }

  async getRefreshToken(req: any, user: any): Promise<any> {
    const now = getNow();
    const deviceName = getDeviceByUserAgent(req.headers['user-agent']);
    const refreshToken = this.encryptAES(`${user._id}-${deviceName}-${now}`);
    const expire = now + this.configService.get<number>('refreshToken.exp') * 3600;
    await this.usersService.addRefreshToken(user._id, refreshToken, expire);
    return refreshToken;
  }

  /** Flow:
   * - auth.controller -> login
   * -> We use Guards: BasicAuthGuard -> basic.strategy->validate()
   * -> auth.service->validateUser()-> return user:{}
   */
  async login({ req, user }) {
    let payload = {};
    if (user) {
      payload = {
        _id: user._id,
        username: user.username,
        name: user.name,
        user_group_id: user.user_group_id,
        store_id: user.store_id,
        setting: user.setting,
        permission: user.permission,
        user_group_name: user.user_group_name,
      };
    } else {
      //login with refresh token
      const projectionList = processProjection(['name', 'username', 'setting', 'user_group_id', 'password', 'permission', 'store_id']);
      let condition = {};
      condition['session.' + req.cookies.refresh_token] = {
        '$gte': getNow()
      };
      const user = await this.usersService.findOne(condition, projectionList);
      if (user) {
        const userGroup = await this.userGroupsService.findById(user.user_group_id);
        payload = {
          _id: user._id,
          username: user.username,
          name: user.name,
          user_group_id: user.user_group_id,
          store_id: user.store_id,
          setting: user.setting,
          permission: userGroup.permission,
          user_group_name: userGroup.name,
        };
      } else {
        await this.usersService.removeRefreshToken(req.cookies.refresh_token);
        throw new UnauthorizedException();
      }
    }
    newAccessToken = this.jwtService.sign(payload);
    newUser = payload;
    return {
      access_token: newAccessToken,
      refresh_token: user ? await this.getRefreshToken(req, user) : req.cookies.refresh_token,
    };
  }

  async logout(req: any) {
    return await this.usersService.removeRefreshToken(req.cookies.refresh_token);
  }
  encryptAES(text: string) {
    let encrypted = crypto.AES.encrypt(text, this.configService.get<string>('refreshToken.secret')).toString();
    return encrypted;
  }

  decryptAES(text: string) {
    let bytesDecrypted = crypto.AES.decrypt(text, this.configService.get<string>('refreshToken.secret'));
    return bytesDecrypted.toString(crypto.enc.Utf8);
  }

  clearRefreshTokenCookie(@Response() res: FastifyReply) {
    res.clearCookie('refresh_token', {
      path: '*'
    });
    res.clearCookie('refresh_token', {
      path: '/api/auth'
    });
    res.clearCookie('refresh_token', {
      path: '/api'
    });
  }
}