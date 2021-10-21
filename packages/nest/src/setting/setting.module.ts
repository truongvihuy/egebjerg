import { Module } from '@nestjs/common';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counter/counter.module';
import { SettingSchema } from './setting.schema';
import { CustomCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    CounterModule,
    CustomCacheModule,
    MongooseModule.forFeature([{ name: 'Setting', schema: SettingSchema }])
  ],
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule { }