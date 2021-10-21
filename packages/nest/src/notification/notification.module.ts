import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { CounterModule } from '../counter/counter.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from './notification.schema';
import { MailModule } from '../mail/mail.module';
import { StoresModule } from '../stores/stores.module';
@Module({
  imports: [
    CounterModule,
    MailModule,
    StoresModule,
    MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }])
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService]
})
export class NotificationModule { }
