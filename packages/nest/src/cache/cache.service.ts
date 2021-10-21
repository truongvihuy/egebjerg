import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { updateFirebase } from '../helper/firebase-helper';
import { getNow } from '../helper/general.helper';
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) { }

  async get(key): Promise<any> {
    return await this.cache.get(key);
  }

  async set(key, value) {
    return await this.cache.set(key, value);
  }

  async del(key) {
    updateFirebase('/config', `${getNow()}`);
    return await this.cache.del(key);
  }
}