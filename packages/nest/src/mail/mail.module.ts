import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counter/counter.module';
import { MailSchema } from './mail.schema';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [
    CounterModule,
    ConfigService,
    MongooseModule.forFeature([{ name: 'Mail', schema: MailSchema }])
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }