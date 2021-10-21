import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from '../counter/counter.module';
import { ZipCodeModule } from '../zip-code/zip-code.module';
import { BrandSchema } from './brand.schema';
import { ProductsModule } from '../products/products.module';
import { CustomCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    CustomCacheModule,
    CounterModule,
    ZipCodeModule,
    ProductsModule,
    MongooseModule.forFeature([{ name: 'Brand', schema: BrandSchema }])
  ],
  providers: [BrandService],
  controllers: [BrandController],
  exports: [BrandService]
})
export class BrandModule { }
