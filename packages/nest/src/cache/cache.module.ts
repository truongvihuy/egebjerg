import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { CacheService } from './redisCache.service';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 500, //By default, the amount of time that a response is cached before deleting it is 5 seconds
      max: 100//Also, the maximum number of elements in the cache is 100 by default
    }),
  ],
  providers: [CacheService],
  exports: [CacheService] // This is IMPORTANT,  you need to export CacheService here so that other modules can use it
})
export class CustomCacheModule { }