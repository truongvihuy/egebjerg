import { Module } from '@nestjs/common';
import { MunicipalityService } from './municipality.service';
import { MunicipalityController } from './municipality.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counter/counter.module';
import { CityModule } from '../city/city.module';
import { ZipCodeModule } from '../zip-code/zip-code.module';
import { MunicipalitySchema } from './municipality.schema';
import { CustomCacheModule } from '../cache/cache.module';
@Module({
  imports: [
    CustomCacheModule,
    CounterModule,
    CityModule,
    ZipCodeModule,
    MongooseModule.forFeature([{ name: 'Municipality', schema: MunicipalitySchema }])
  ],
  providers: [MunicipalityService],
  controllers: [MunicipalityController]
})
export class MunicipalityModule { }
