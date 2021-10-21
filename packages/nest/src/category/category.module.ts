import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ProductsModule } from '../products/products.module';
import { CounterModule } from '../counter/counter.module';
import { ThumborModule } from '../thumbor/thumbor.module';
import { CategorySchema } from './category.schema';
import { CustomCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    CustomCacheModule,
    forwardRef(() => ProductsModule),
    CounterModule,
    ThumborModule,
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule { }