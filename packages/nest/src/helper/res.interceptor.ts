import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatusException } from './exception';
import { newUser, newAccessToken, resetNewUser } from '../auth/auth.service';
@Injectable()
export class ResInterceptor implements NestInterceptor {
  private status = 200;
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        map(data => {
          const header = context.switchToHttp().getResponse().getHeaders();
          if (header['content-type'] == 'application/octet-stream' || header['content-type'] == 'text/plain') {
            return data;
          }
          if (newAccessToken) {
            const newAccessTokenTmp = newAccessToken;
            resetNewUser();

            return {
              data,
              new_access_token: newAccessTokenTmp,
            };
          }

          return { data };
        })
      );
  }
}