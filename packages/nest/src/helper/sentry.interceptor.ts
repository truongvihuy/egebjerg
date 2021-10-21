import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/minimal';

@Injectable()
export class SentryInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        tap(null, (exception) => {
          if ((!!exception.status && exception.status >= 500) || !exception.constructor.toString().includes('HttpException')) {
            Sentry.captureException(exception);
          }
        }),
      );
  }

}