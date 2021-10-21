import { Module } from '@nestjs/common';
import { ZipCodeService } from './zip-code.service';
import { ZipCodeController } from './zip-code.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersModule } from '../customers/customers.module';
import { CounterModule } from '../counter/counter.module';
import { StoresModule } from '../stores/stores.module';
import { ZipCodeSchema } from './zip-code.schema';
@Module({
  imports: [
    CounterModule,
    CustomersModule,
    StoresModule,
    MongooseModule.forFeature([{ name: 'ZipCode', schema: ZipCodeSchema }])
  ],
  providers: [ZipCodeService],
  controllers: [ZipCodeController],
  exports: [ZipCodeService]
})
export class ZipCodeModule { }
