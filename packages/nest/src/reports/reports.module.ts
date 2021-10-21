import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from '../order/order.schema';
import { StoreSchema } from '../stores/stores.schema';
import { OrderBakerySchema } from '../order-bakery/order-bakery.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }, { name: 'Store', schema: StoreSchema }, { name: 'OrderBakery', schema: OrderBakerySchema, }])
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule { }