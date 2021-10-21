import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewspapersController } from './newspapers.controller';
import { NewspapersService } from './newspapers.service';
import { NewspapersSchema } from './newspapers.schema';
import { OffersModule } from '../offers/offers.module';
import { ThumborModule } from '../thumbor/thumbor.module';
import { CounterModule } from '../counter/counter.module';

@Module({
  imports: [
    OffersModule,
    CounterModule,
    ThumborModule,
    MongooseModule.forFeature([{ name: 'Newspapers', schema: NewspapersSchema }])
  ],
  controllers: [NewspapersController],
  providers: [NewspapersService],
  exports: [NewspapersService],
})
export class NewspapersModule { }