import { Module } from '@nestjs/common';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counter/counter.module';
import { ZipCodeModule } from '../zip-code/zip-code.module';
import { CitySchema } from './city.schema';
import { CustomCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    CustomCacheModule,
    CounterModule,
    ZipCodeModule,
    MongooseModule.forFeature([{ name: 'City', schema: CitySchema }])
  ],
  providers: [CityService],
  controllers: [CityController],
  exports: [CityService]
})
export class CityModule { }
