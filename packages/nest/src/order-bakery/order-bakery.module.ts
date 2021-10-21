import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counter/counter.module';
import { OrderBakeryService } from './order-bakery.service';
import { OrderBakerySchema } from './order-bakery.schema';

@Module({
  imports: [
    CounterModule,
    MongooseModule.forFeature([{ name: 'OrderBakery', schema: OrderBakerySchema }]),
  ],
  controllers: [],
  providers: [OrderBakeryService],
  exports: [OrderBakeryService],
})
export class OrderBakeryModule { }