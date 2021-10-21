import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counter/counter.module';
import { ProductsModule } from '../products/products.module';
import { CustomerSchema } from './customers.schema';
import { TransactionSchema } from '../transaction/transaction.schema';

@Module({
  imports: [
    CounterModule,
    ProductsModule,
    MongooseModule.forFeature([{ name: 'Customers', schema: CustomerSchema }]),
    MongooseModule.forFeature([{ name: 'Transaction', schema: TransactionSchema }])
  ],
  providers: [CustomersService],
  controllers: [CustomersController],
  exports: [CustomersService]
})
export class CustomersModule { }
