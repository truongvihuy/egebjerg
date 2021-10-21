import { Module } from '@nestjs/common';
import { PBSController } from './pbs.controller';
import { PBSService } from './pbs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counter/counter.module';
import { OrderModule } from '../order/order.module';
import { CustomersModule } from '../customers/customers.module';
import { SettingModule } from '../setting/setting.module';
import { PBSSchema } from './pbs.schema';
import { TransactionSchema } from '../transaction/transaction.schema';

@Module({
  imports: [
    CustomersModule,
    OrderModule,
    OrderModule,
    SettingModule,
    CounterModule,
    MongooseModule.forFeature([{ name: 'PBS', schema: PBSSchema }]),
    MongooseModule.forFeature([{ name: 'Transaction', schema: TransactionSchema }])
  ],
  controllers: [PBSController],
  providers: [PBSService]
})
export class PBSModule { }