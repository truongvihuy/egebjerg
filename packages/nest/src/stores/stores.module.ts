import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { CounterModule } from '../counter/counter.module';
import { StoreSchema } from './stores.schema';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    CounterModule,
    CustomersModule,
    MongooseModule.forFeature([{ name: 'Stores', schema: StoreSchema }])
  ],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule { }