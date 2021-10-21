import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CounterModule } from '../counter/counter.module';
import { OrderBakeryModule } from '../order-bakery/order-bakery.module';
import { CustomersModule } from '../customers/customers.module';
import { OrderSchema } from './order.schema';
import { OrderQuickpaySchema } from './order_quickpay.schema';
import { ProductsModule } from '../products/products.module';
import { MailModule } from '../mail/mail.module';
import { StoresModule } from '../stores/stores.module';
import { NotificationModule } from '../notification/notification.module';
import { SettingModule } from '../setting/setting.module';

@Module({
  imports: [
    NotificationModule,
    CounterModule,
    CustomersModule,
    ProductsModule,
    MailModule,
    StoresModule,
    SettingModule,
    OrderBakeryModule,
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: 'OrderQuickpay', schema: OrderQuickpaySchema }]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule { }