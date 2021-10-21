import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';
import { CounterModule } from '../counter/counter.module';
import { ThumborModule } from '../thumbor/thumbor.module';
import { NewspapersModule } from '../newspapers/newspapers.module';
import { OffersModule } from '../offers/offers.module';
import { CategoryModule } from '../category/category.module';
import { StoresModule } from '../stores/stores.module';
import { OrderModule } from '../order/order.module';
import { OrderBakeryModule } from '../order-bakery/order-bakery.module';
import { MailModule } from '../mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskSchema } from './task.schema';
import { MailQueueSchema } from '../mail-send/mail-send.schema';
import { TaskController } from './task.controller';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SettingModule } from '../setting/setting.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }]),
    MongooseModule.forFeature([{ name: 'MailQueue', schema: MailQueueSchema }]),
    ProductsModule,
    CustomersModule,
    CounterModule,
    ThumborModule,
    NewspapersModule,
    OffersModule,
    CategoryModule,
    StoresModule,
    OrderModule,
    MailModule,
    SettingModule,
    OrderBakeryModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule { }