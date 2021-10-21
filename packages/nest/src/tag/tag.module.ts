import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counter/counter.module';
import { ZipCodeModule } from '../zip-code/zip-code.module';
import { TagSchema } from './tag.schema';
import { CustomCacheModule } from '../cache/cache.module';
@Module({
  imports: [
    CustomCacheModule,
    CounterModule,
    ZipCodeModule,
    MongooseModule.forFeature([{ name: 'Tag', schema: TagSchema }])
  ],
  providers: [TagService],
  controllers: [TagController],
  exports: [TagService]
})
export class TagModule { }
