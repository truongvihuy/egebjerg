import { Injectable } from '@nestjs/common';
import { BrandService } from './brand/brand.service';
import { TagService } from './tag/tag.service';
import { CategoryService } from './category/category.service';
import { StoresService } from './stores/stores.service';
import { SettingService } from './setting/setting.service';

@Injectable()
export class AppService {
  constructor(
    private brandService: BrandService,
    private tagService: TagService,
    private categoryService: CategoryService,
    private storeService: StoresService,
    private settingService: SettingService,
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getConfig() {
    return {
      brand_list: await this.brandService.findAll(),
      tag_list: await this.tagService.findAll(),
      category_list: await this.categoryService.getTreeByCategoryId('null'),
      store_list: await this.storeService.findAll(),
      setting_list: await this.settingService.findAll(),
    }
  }
}
