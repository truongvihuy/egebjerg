import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterService } from './counter.service';
import { CounterSchema } from './counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Counter', schema: CounterSchema }]),
  ],
  controllers: [],
  providers: [CounterService],
  exports: [CounterService],
})
export class CounterModule { }