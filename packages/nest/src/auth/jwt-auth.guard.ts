import { ExecutionContext, Injectable, UnauthorizedException, Request } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../helper/customDecorator';
import { AuthService } from './auth.service';
import { newUser, newAccessToken } from './auth.service';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private authService: AuthService,
    private reflector: Reflector
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, @Request() req) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      if (!!req.args[0].cookies.refresh_token) {
        return this.authService.login({ req: req.args[0], user: null }).then(response => {
          return newUser
        });
        throw new UnauthorizedException();
      } else {
        throw err || new UnauthorizedException();
      }
    }
    return user;
  }
}