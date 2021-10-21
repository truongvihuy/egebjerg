import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from '../notification/notification.schema';
import { OrderSchema } from '../order/order.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }, { name: 'Order', schema: OrderSchema }])
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService]
})
export class DashboardModule { }
