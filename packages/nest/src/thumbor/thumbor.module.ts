import { Module } from '@nestjs/common';
import { ThumborService } from './thumbor.service';
@Module({
  providers: [ThumborService],
  exports: [ThumborService],
})
export class ThumborModule { }
