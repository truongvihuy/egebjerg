import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { OffersSchema } from './offers.schema';
import { NewspapersModule } from '../newspapers/newspapers.module';
import { CounterModule } from '../counter/counter.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    forwardRef(() => NewspapersModule),
    CounterModule,
    ProductsModule,
    MongooseModule.forFeature([{ name: 'Offers', schema: OffersSchema }]),
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule { }