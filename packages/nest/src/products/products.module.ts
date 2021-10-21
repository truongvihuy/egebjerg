import { Module, forwardRef } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counter/counter.module';
import { CategoryModule } from '../category/category.module';
import { ProductsSchema } from './products.schema';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [
    CounterModule,
    forwardRef(() => CategoryModule),
    ConfigService,
    MongooseModule.forFeature([{ name: 'Products', schema: ProductsSchema }])
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }