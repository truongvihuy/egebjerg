import { BadRequestException, Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';
import { CategoryDTO } from './category.dto';
import { Model } from 'mongoose';
import { generateProjection, generateSlug } from '../helper/general.helper';
import { CounterService } from '../counter/counter.service';
import { ThumborService } from '../thumbor/thumbor.service';
import { ProductsService } from '../products/products.service';
import { updateFirebase } from '../helper/firebase-helper';
import { getNow } from '../helper/time.helper';
import BaseService from '../helper/base.service';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CategoryService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    private thumborService: ThumborService,
    @Inject(forwardRef(() => ProductsService))
    private productService: ProductsService,
    private cacheManager: CacheService,
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
  ) {
    super(counterService, configService);
  }
  private readonly columns = ['_id', 'name', 'level', 'parent_id', 'slug', 'img', 'children', 'children_direct', 'order', 'img_bk', 'desc_short', 'desc_full', 'active']
  private readonly collectionName = 'category'

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findById(id: number): Promise<Category> {
    return this.categoryModel.findOne({ _id: id });
  }

  processData(category, data) {
    return {
      name: data.name ?? category.name,
      level: data.level ?? category.level,
      parent_id: data.parent_id !== undefined ? data.parent_id : category.parent_id,
      slug: data.slug ?? category.slug,
      img: data.img ?? category.img,
      children: data.children ?? category.children,
      children_direct: data.children_direct !== undefined ? data.children_direct : category.children_direct,
      order: data.order ?? category.order,
      active: data.active ?? category.active,
    }
  }

  async updateOne(data, user) {
    const category = await this.findById(data._id);
    if (!!data.name && data.name !== category.name) {
      data.slug = generateSlug(data.name);
    }
    if (data.img.length == 32) {// pattern uuid
      data.img = `${data.img}/${data.slug ?? category.slug}.svg`
    }

    if (data.hasOwnProperty('active') && data.active !== category.active && category.children.length > 0) {
      await this.categoryModel.updateMany(
        { _id: { $in: category.children } },
        {
          '$set': { active: data.active },
        }
      );
    }
    if (data.hasOwnProperty('img')) {
      //data.img is uuid
      // await this.thumborService.delete({ uuid: category.img.replace(`/${category.slug}.svg`, '') });
    }

    let _id = data._id;
    delete data._id;
    const result = await this.updateById(_id, data, this.categoryModel);
    await this.cacheManager.del('category_tree');
    updateFirebase('/config', getNow());
    return result;
  }

  async updateList(dataList: CategoryDTO[], user) {
    let bulkWriteList = [];
    const categoryListDb = await this.findAll();
    const categoryMap = {};
    categoryListDb.forEach(category => {
      categoryMap[category._id] = category;
    })
    dataList.forEach((category: any) => {
      let categorytoUpdate = { ...category };
      try {
        categorytoUpdate = this.processData(categoryMap[category._id], categorytoUpdate);
      } catch (e) {
        return e;
      }
      // delete categorytoUpdate._id;
      bulkWriteList.push({
        'updateOne': {
          filter: {
            _id: parseFloat(category._id.toString())
          },
          'update': categorytoUpdate
        }
      });
    });
    const result = await this.categoryModel.bulkWrite(bulkWriteList);
    if (result.result.writeErrors.length > 0 || result.result.writeConcernErrors.length > 0) {
      throw new BadRequestException();
    }
    await this.cacheManager.del('category_tree');
    updateFirebase('/config', getNow());
    return this.getTreeByCategoryId(null);
  }

  async getTreeByCategoryId(_id) {
    let categoryList = [];
    let categoryMap = {};
    if (_id === 'null') {
      categoryList = (await this.cacheManager.get('category_tree')) ?? [];
      if (categoryList.length == 0) {
        await this.getCatTree(null, categoryList, categoryMap);
        await this.cacheManager.set('category_tree', categoryList);
      }
    } else {
      await this.getCatTree(_id, categoryList, categoryMap);
    }
    return categoryList;
  }

  async getCatTree(root, categoryList, categoryMap, justBasicInfo = false) {
    const childList = await this.getChildCat(root, justBasicInfo);
    if (childList.length == 0) {
      return;
    } else {
      for (let i = 0; i < childList.length; i++) {
        const category = childList[i];
        categoryList.push(category);
        categoryMap[category._id] = category;
        await this.getCatTree(category._id, categoryList, categoryMap, justBasicInfo);
      }
    }
  }

  async getChildCat(parent_id, justBasicInfo = false) {
    let columns = this.columns;

    if (justBasicInfo) {
      columns = ['name', 'name_vn', 'parent_id', 'level', 'active'];
    }
    const projection = generateProjection(columns);
    let childList = await this.categoryModel.find({ parent_id }, projection, { sort: { order: 1 } });
    if (childList.length == 0) {
      return [];
    }

    let [parentCat, parentName] = [null, null, null];
    if (parent_id != null) {
      parentCat = this.categoryModel.findOne({ _id: parent_id }, { projection: { name: 1 } });
      if (parentCat) {
        parentName = parentCat.name;
      }
    }

    let newChildList = childList.map((x: any) => {
      return {
        ...x._doc,
        parent_name: parentName
      };
    });
    return newChildList;
  }

  async create(category, user) {
    const initData = {
      name: '',
      level: 1,
      parent_id: null,
      slug: '',
      img: '',
      children: [],
      children_direct: [],
      order: 0,
      active: true,
    };
    category.slug = generateSlug(category.name);
    // category.img = `/images/category/${_id}-${category.slug}`;
    if (category.img.length == 32) {// pattern uuid
      category.img = `${category.img}/${category.slug}.svg`
    }

    const newCategory = new this.categoryModel({
      ...this.processData(initData, category),
    });
    const result = await this.save(newCategory, this.collectionName,
      (_id, model) => { // processFnPreSave
        model.children.push(_id);
      },
      (_id, model) => { // processFnRetry
        model.children = model.children.filter(idChildren => idChildren !== _id);
      }
    );
    if (result) {
      // update order in category list
      await this.categoryModel.updateMany(
        { '$and': [{ order: { '$gte': category.order } }, { _id: { '$ne': result._id } }] },
        { '$inc': { order: 1 } }
      );
      // update field children of parent
      let parent_id = category.parent_id;
      let bulkWriteList = [];
      while (parent_id) {
        let categorytoUpdate: any = await this.findById(parent_id);
        categorytoUpdate = categorytoUpdate._doc;
        categorytoUpdate.children.push(result._id);
        if (!categorytoUpdate.children_direct) {
          categorytoUpdate.children_direct = [];
        }
        if (parent_id === category.parent_id) {
          categorytoUpdate.children_direct.push(result._id);
        }
        delete categorytoUpdate._id;
        bulkWriteList.push({
          'updateOne': {
            filter: {
              _id: parent_id,
            },
            'update': categorytoUpdate
          }
        });

        parent_id = categorytoUpdate.parent_id;
      }
      await this.categoryModel.bulkWrite(bulkWriteList);
      await this.cacheManager.del('category_tree');
      updateFirebase('/config', getNow());
      return result;
    }
    throw new BadRequestException();
  }

  async delete(_id, user) {
    if (!!_id && !isNaN(+_id)) {
      _id = +_id;
      let category = await this.categoryModel.findOne({ _id });

      if (category) {
        const productList = await this.productService.findByCondition({ category_id: { '$in': category.children } });
        if (productList.length > 0) {
          throw new BadRequestException('Der er stadig produkter i kataloget');
        }
        const result = await this.categoryModel.deleteMany({ _id: { '$in': category.children } });
        if (result) {
          await this.cacheManager.del('category_tree');
          await this.thumborService.delete({ uuid: category.img.replace(`/${category.slug}.svg`, '') });
          updateFirebase('/config', getNow());
          return {
            success: true
          }
        }
        throw new BadRequestException('sletning mislykkedes');
      }
    }
    throw new BadRequestException('id er ikke gyldig');
  }
}