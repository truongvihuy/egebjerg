import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ResInterceptor } from './helper/res.interceptor';
import { SentryInterceptor } from './helper/sentry.interceptor';
import { ScheduleModule } from '@nestjs/schedule';

import config from './config/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserGroupsModule } from './user-groups/user-groups.module';
import { OrderModule } from './order/order.module';
import { ProductsModule } from './products/products.module';
import { NewspapersModule } from './newspapers/newspapers.module';
import { OffersModule } from './offers/offers.module';
import { StoresModule } from './stores/stores.module';
import { MunicipalityModule } from './municipality/municipality.module';
import { ZipCodeModule } from './zip-code/zip-code.module';
import { CityModule } from './city/city.module';
import { CustomersModule } from './customers/customers.module';
import { ThumborModule } from './thumbor/thumbor.module';
import { SettingModule } from './setting/setting.module';
import { CounterModule } from './counter/counter.module';
import { MailModule } from './mail/mail.module';
import { BrandModule } from './brand/brand.module';
import { PBSModule } from './pbs/pbs.module';
import { TaskModule } from './task/task.module';
import { TagModule } from './tag/tag.module';
import { ReportsModule } from './reports/reports.module';
import { CustomCacheModule } from './cache/cache.module';
import { NotificationModule } from './notification/notification.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OrderBakeryModule } from './order-bakery/order-bakery.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          uri: `${configService.get<string>('database.uri')}`,
          useFindAndModify: false,
        }
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    CategoryModule,
    AuthModule,
    UsersModule,
    UserGroupsModule,
    OrderModule,
    CounterModule,
    StoresModule,
    CustomersModule,
    NewspapersModule,
    OffersModule,
    ProductsModule,
    MunicipalityModule,
    ZipCodeModule,
    ThumborModule,
    CityModule,
    ThumborModule,
    SettingModule,
    MailModule,
    BrandModule,
    PBSModule,
    TaskModule,
    TagModule,
    ReportsModule,
    CustomCacheModule,
    NotificationModule,
    DashboardModule,
    OrderBakeryModule,
  ],
  controllers: [AppController,],
  providers: [
    AppService,
    {
      /**
       * All routes will apply JwtAuthGuard
       * If route has @Public decorator, JwtAuthGuard will be ignored
       * Ex: /auth/login
       */
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
  ],
})
export class AppModule { }
