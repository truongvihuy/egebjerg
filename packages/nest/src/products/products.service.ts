import { Injectable, BadRequestException, HttpException, HttpStatus, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Products } from './products.schema';
import { ProductsDTO } from './products.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import { ConfigService } from '@nestjs/config';
import { CategoryService } from '../category/category.service';
import { NUMBER_ROW_PER_PAGE, ELASTIC_INDEX, PRODUCT_STATUS } from '../config/constants';
import { generateProjection, generateSlug } from '../helper/general.helper';
import BaseService from '../helper/base.service';
import { cloneDeep, difference } from 'lodash';

const collectionName = 'product';
const frozenCategoryId = 1270;
@Injectable()
export class ProductsService extends BaseService {
  constructor(
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
    counterService: CounterService,
    configService: ConfigService,
    @InjectModel('Products') public readonly productsModel: Model<Products>
  ) {
    super(counterService, configService);
  }
  async findOneByCondition(condition: any, projection = null, option = null): Promise<Products> {
    return await this.productsModel.findOne(condition, projection, option);
  }

  async findAll(): Promise<any> {
    return this.productsModel.find().sort({ _id: 1 }).exec();
  }

  processKeyword(keyword: string) {
    // special character will be replace to space character so we cannot found what we need
    // We must process these keyword when index and search
    // For example: we cannot search item number: 17-1040 so we must process it to 17x1040
    // We cannot process it to 171040 because an item number can be 1710401 or 1710402
    if (typeof keyword === 'string') {
      keyword = keyword.trim();
      return keyword.replace(/\-/ig, 'x');
    }

    return keyword;
  }

  async findById(id: number): Promise<Products> {
    id = +id;
    let product = (await this.findByCondition({ _id: id }, null, { limit: 1 }))[0] ?? null;
    if (product) {
      return product;
    }
    throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
  }

  async find(query: any): Promise<any> {
    let _id = query._id || null;

    let total = 0;
    let { limit = NUMBER_ROW_PER_PAGE, page = 1 } = query;
    limit = +limit;
    page = +page;

    // If do not have any filter, just return from mongoDB, do not use elastic
    let keyList = Object.keys(query);
    let differentList = difference(keyList, ['limit', 'page', 'sort']);
    if (differentList.length === 0 && query.sort === '_id:-1') {
      let productList = await this.findByCondition({}, null, {
        sort: {
          _id: -1
        },
        limit
      });

      total = await this.counterService.getTotal(collectionName);
      if (total === null) {
        total = await this.productsModel.countDocuments({});
      }

      return {
        product_list: productList,
        total
      };
    }

    let statusList = null;
    if (query.status) {
      if (query.status === '0') {
        statusList = [PRODUCT_STATUS.inactive, PRODUCT_STATUS.inactiveOffer];
      } else if (query.status === '1') {
        statusList = [PRODUCT_STATUS.active, PRODUCT_STATUS.activeOffer];
      } else if (query.status === 'active') {
        statusList = [PRODUCT_STATUS.active, PRODUCT_STATUS.inactiveOffer, PRODUCT_STATUS.activeOffer, PRODUCT_STATUS.associated];
      } else {
        //query[key] == PRODUCT_STATUS.inactiveOffer || query[key] == PRODUCT_STATUS.activeOffer || PRODUCT_STATUS.associated
        statusList = [parseInt(query.status)];
      }
    }

    let customerId = null;
    if (query.customer_id) {
      customerId = parseInt(query.customer_id);
    }

    if (query.name) {
      query.name = query.name.trim();

      if (/^\!([\d-]+)$/.exec(query.name)) {
        let itemNumber = query.name.substring(1);
        if (customerId && statusList) { // Search when create order
          return {
            product_list: await this.findByCondition({ item_number: itemNumber, status: { $in: statusList } }, null)
          };
        }

        return {
          product_list: await this.findByCondition({ item_number: itemNumber }, null)
        };
      }

      if (/^\#(\d+)/.exec(query.name)) {
        _id = parseInt(query.name.substring(1));
      }
    }

    if (_id) {
      return {
        product_list: await this.findByCondition({ _id: parseInt(_id) }, null, { limit: 1 })
      }
    }

    query.name = this.processKeyword(query.name);



    let option: any = {
      sort: { id: -1 },
      limit,
      // skip: limit * (page - 1),
    };

    let condition: any = {};

    let queryElastic: any = {
      index: ELASTIC_INDEX.product,
      body: {
        _source: false,
        query: {
          bool: {
            must: []
          }
        },
        sort: [
          {
            id: {
              order: 'desc'
            }
          }
        ],
      }
    };

    if (!!query.id_list) {
      let idList = query.id_list.split(',').map(x => parseInt(x));
      condition['_id'] = {
        '$in': idList
      };
      if (statusList) {
        condition['status'] = {
          '$in': statusList,
        }
      }
    } else {
      //check search elastic
      for (const key in query) {
        if (query[key] == null) {
          continue;
        }
        switch (key) {
          case 'page':
          case 'limit':
            break;
          case 'name':
            delete option.sort;
            delete option.skip;
            delete option.limit;
            break;
          case 'is_coop_xtra':
          case 'is_ecology':
          case 'is_frozen':
            // condition[key] = query[key] == 'true';
            queryElastic.body.query.bool.must.push({
              'match': {
                [key]: query[key] == 'true'
              }
            });
            break;
          //Support sortting by total_bought
          case 'sort':
            let sortSplit = query.sort.split(':');
            option.sort = {
              [sortSplit[0]]: +sortSplit[1]
            };
            queryElastic.body.sort = [
              {
                [(sortSplit[0] == '_id') ? 'id' : sortSplit[0]]: {
                  order: (sortSplit[1] == '1') ? 'asc' : 'desc'
                }
              }
            ]
            break;
          case 'category_id':
            queryElastic.body.query.bool.must.push({
              term: {
                [key]: parseInt(query[key])
              }
            });
            break;
          case 'just_backend':
            queryElastic.body.query.bool.must.push({
              term: {
                just_backend: query.just_backend == 'true'
              }
            });
            break;
          case 'brand_id':
            queryElastic.body.query.bool.must.push({
              term: {
                brand_id: parseInt(query[key])
              }
            });
            break;
          case 'tag_id_list':
            queryElastic.body.query.bool.must.push({
              'match': {
                [key]: parseInt(query[key])
              }
            });
            break;
          case 'status':
            if (statusList) {
              queryElastic.body.query.bool.must.push({
                terms: {
                  status: statusList
                }
              });
            }
            break;
          case 'is_offer':
            queryElastic.body.query.bool.must.push({
              terms: {
                status: [PRODUCT_STATUS.inactiveOffer, PRODUCT_STATUS.activeOffer]
              }
            });
            break;
          default:
            break;
        }
      }

      let indexName = { index: ELASTIC_INDEX.product };
      let searchResult: any = {
        hits: {
          total: {
            value: 0
          }
        }
      };
      let productIdList = [];

      // Example:
      // Name: Le Rustique Camembert 45+/21% 250 g.
      // Support keyword = Le 250
      // queryBody.query.bool.must.push({
      //   match: {
      //     full_text: {
      //       query: elasticKeyword,
      //       operator: 'and'
      //     },
      //   }
      // });

      if (query.name) {
        delete queryElastic.body.sort;
        // Name: Stryhns Fransk Leverpostej 450 g.
        // Must support keyword = *keyword* | *mælk*
        queryElastic.body.query.bool.must.push({
          match: {
            full_text: {
              query: query.name,
              operator: 'and'
            },
          }
        });
      }

      if (customerId) { // Search when Creating Order
        let queryBody = cloneDeep(queryElastic.body);
        queryBody.size = 100;

        let queryBodyHistory = cloneDeep(queryBody);
        queryBodyHistory.query.bool.must.push({
          term: {
            purchase_history: customerId,
          }
        });

        queryElastic.body = [
          indexName,
          queryBody,
          indexName,
          queryBodyHistory,
        ];
        // console.log(query);
        // console.log('CREATING ORDER: \n', JSON.stringify(queryElastic.body));
        searchResult = (await this.elasticSearch.msearch(queryElastic)).body;
        // console.log("\n---------\n" + JSON.stringify(searchResult.responses));
        let productIdList = searchResult.responses[0].hits.hits.map(x => parseInt(x._id));
        let productPurchasedIdList = searchResult.responses[1].hits.hits.map(x => parseInt(x._id));

        return {
          product_list: await this.findByCondition({ _id: { $in: productIdList } }),
          product_purchased_list: await this.findByCondition({ _id: { $in: productPurchasedIdList } })
        }
      }

      queryElastic.body.from = limit * (page - 1);
      queryElastic.body.size = limit;
      // console.log('QUERY:\n', JSON.stringify(queryElastic));
      searchResult = (await this.elasticSearch.search(queryElastic)).body;
      // console.log('\nRESULT:\n', JSON.stringify(searchResult));
      searchResult.hits.hits.forEach(x => {
        productIdList.push(parseInt(x._id))
      })

      if (searchResult.hits?.total?.value >= 0) {
        if (page == 1) {
          // delete queryElastic.body.from;
          // delete queryElastic.body.size;
          // delete queryElastic.body.sort;
          // console.log('COUNT:', JSON.stringify(queryElastic));
          // total = (await this.elasticSearch.count(queryElastic)).body.count;

          // Try to just use searchResult.hits.total.value
          total = searchResult.hits.total.value;
        }

        condition._id = {
          $in: productIdList
        };
      }
    }

    let productList = await this.findByCondition(condition, null, option);
    if (page == 1) {
      if (total == 0) {
        total = await this.productsModel.countDocuments(condition);
      }
      return {
        product_list: productList,
        total: total
      }
    } else {
      return {
        product_list: productList,
      }
    }
  }

  async findByIdList(idList): Promise<Products[]> {
    return this.productsModel.find({ _id: { $in: idList } }).sort({ _id: 1 }).exec();
  }

  async findByCondition(condition: any = {}, projection: any = null, option: any = {}): Promise<Products[]> {
    let isEmptyOption = Object.keys(option).length === 0;
    let isEmptyProjection = projection != null && Object.keys(projection).length === 0;
    let aggregateList: any = [{
      $match: condition ?? {}
    }];
    if (!isEmptyOption) {
      aggregateList = aggregateList.concat([
        {
          $sort: option.sort ?? { _id: 1 }
        }, {
          $skip: option.skip ?? 0
        }, {
          $limit: option.limit ?? NUMBER_ROW_PER_PAGE
        }
      ]);
    } else if (condition._id && condition._id.hasOwnProperty('$in')) {
      aggregateList = aggregateList.concat([
        {
          '$addFields': {
            'sortByIndexOfArray': {
              '$indexOfArray': [condition['_id']['$in'], '$_id']
            }
          }
        },
      ]);
    }
    aggregateList = aggregateList.concat([{
      $lookup: {
        from: 'category',
        localField: 'category_id',
        foreignField: '_id',
        as: 'category'
      }
    }, {
      $lookup: {
        from: 'tag',
        localField: 'tag_id_list',
        foreignField: '_id',
        as: 'tag_list'
      }
    }, {
      $lookup: {
        from: 'brand',
        localField: 'brand_id',
        foreignField: '_id',
        as: 'brand'
      }
    }, {
      $lookup: {
        from: 'offer',
        localField: '_id',
        foreignField: 'product_id_list',
        as: 'offer'
      }
    }, {
      $set: {
        offer: {
          $first: '$offer'
        },
        brand: {
          $first: '$brand'
        },
      }
    }]);
    if (!isEmptyProjection) {
      aggregateList = aggregateList.concat([{
        $project: projection ?? { empty: 0 }
      }]);
    }

    // console.log(JSON.stringify(aggregateList));
    let productList = await this.productsModel.aggregate(aggregateList).exec();
    productList = productList.map(x => {
      return {
        ...x,
        price: parseFloat(x.price)
      }
    })
    return productList;
  }

  async insert(product: ProductsDTO) {
    let slug = generateSlug(product.name);
    let newProduct = new this.productsModel({
      ...product,
      price_no_tax: (product.price * 0.75).toFixed(4),
      slug,
      image: `${product.image}/${slug}.jpg`,
      total_bought: 0,
    });
    newProduct = await this.processFrozen(newProduct);
    const result = await this.save(newProduct, collectionName, (_id, model) => {
      model.order = _id * 100;
    });
    if (result) {
      // Must findById to join with other collection and return
      let product = await this.findById(result._id);
      await this.indexElastic([product]);
      return product;
    }
    throw new InternalServerErrorException('Error!');
  }

  async update(_id: number, data) {
    if (!!data._id) {
      delete data._id;
    }
    let product = await this.productsModel.findOne({ _id });
    if (product) {
      let slug = product.slug;
      if (!!data.name && product.name != data.name) {
        data.slug = slug = generateSlug(data.name);
      }
      if (!!data.image && product.image != data.image) {
        data.image = `${data.image}/${slug}.jpg`;
      }
      if (!!data.price && product.price != data.price) {
        data.price_no_tax = (data.price * 0.75).toFixed(4);
      }
      data = await this.processFrozen(data);
      const result = await this.updateById(_id, data, this.productsModel);

      // Must findById to join with other collection and return
      product = await this.findById(result._id);
      await this.indexElastic([product]);

      return product;
    }
    throw new BadRequestException('Ingen By fundet');
  }

  async delete(_id: number) {
    const result = await this.remove(_id, this.productsModel, collectionName);
    if (result) {
      this.deleteIndex(_id);
      return result;
    }
  }

  async getByIdList(idList: number[]) {
    const result = await this.productsModel.aggregate([
      {
        $match: { _id: { $in: idList } }
      }, {
        $lookup: {
          from: 'category',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category'
        }
      }, {
        $lookup: {
          from: 'offer',
          localField: '_id',
          foreignField: 'product_id_list',
          as: 'offer'
        }
      }, {
        $set: {
          offer: {
            $arrayElemAt: ['$offer', 0]
          }
        }
      }
    ]).exec();
    return result ?? [];
  }

  async searchForOrder(name, category_id) {
    let queryElastic: any = {
      index: ELASTIC_INDEX.product,
      size: 1,
      body: {
        query: {
          bool: {
            must: [
              {
                'match': {
                  full_text: name
                }
              },
              {
                'match': {
                  category_id
                }
              }
            ]
          }
        }
      }
    };
    const searchResult = (await this.elasticSearch.search(queryElastic)).body;
    if (searchResult.hits.total.value > 0) {
      let _id = +searchResult.hits.hits[0]._id;
      let result = [];
      let product = (await this.findByCondition({ _id, category_id }, null, { limit: 1 }))[0];
      let productBefore = await this.productsModel.find({
        order: { $lt: product.order },
        category_id
      }).sort({ order: -1 }).limit(5);
      let productAfter = await this.productsModel.find({
        order: { $gt: product.order },
        category_id
      }).sort({ order: 1 }).limit(5);
      return {
        product_list: [...productBefore.reverse(), ...[product], ...productAfter],
      }
    } else {
      return {
        product_list: []
      };
    }
  }

  async updateOrder(_id, order) {
    let product = await this.productsModel.findOne({ _id }, {}, { lean: true });
    let productOld = await this.productsModel.findOne({ order });
    if (productOld == null) {
      return [await this.updateById(_id, { order }, this.productsModel)];
    } else {
      let processed = false;
      let skip = 0;
      let limit = 10;
      let orderCount = order;
      let responseList = [{ ...product, order }];
      do {
        let orderCountBegin = orderCount;
        let productList = await this.productsModel.find({ order: { $gte: orderCount } }, {}, { lean: true }).sort({ order: 1 }).skip(0).limit(limit);
        let orderIdMap: any = {};
        productList.forEach(x => {
          orderIdMap[x.order] = x
        })

        while (typeof orderIdMap[orderCount] != 'undefined') {
          if (orderIdMap[orderCount].category_id.filter(value => -1 !== product.category_id.indexOf(value)).length > 0 && !responseList.map(x => x._id).includes(orderIdMap[orderCount]._id)) {
            responseList.push({ ...orderIdMap[orderCount], order: orderCount + 1 });
          }
          await this.productsModel.updateOne({ _id: orderIdMap[orderCount]._id }, { $set: { order: orderCount + 1 } });
          orderCount++;
        }

        if (orderCount - orderCountBegin < limit) {
          processed = true;
          break;
        }
        skip += limit;
      } while (processed == false)

      await this.productsModel.updateOne({ _id }, { $set: { order } });
      return responseList;
    }
  }

  async updateTotalBought(totalBoughtList, customerId) {
    Object.keys(totalBoughtList).forEach(async (_id) => {
      const data = {
        $inc: {
          total_bought: totalBoughtList[_id],
          [`purchase_history.${customerId}`]: totalBoughtList[_id],
        }
      }
      const result = await this.updateById(+_id, data, this.productsModel);
      if (result) {
        await this.indexElastic([result]);
      }
    });
    return {
      success: true
    };
  }

  async indexElastic(productList: any[] = null, productIdList: number[] = null) {
    if ((!productList && !productIdList) || (productIdList && productIdList.length === 0)) {
      return;
    }

    if (!productList) {
      productList = await this.findByCondition({ _id: { $in: productIdList } });
    }
    let elasticDataSet = [];
    let dataList = [];
    let total = 0;
    productList.forEach(product => {
      total++;

      elasticDataSet.push({ index: { _index: ELASTIC_INDEX.product, _id: product._id } });

      let fullText = '';
      if (product.item_number && product.item_number.length > 0) {
        product.item_number.forEach((itemNumber) => {
          if (itemNumber) {
            fullText += ' ' + itemNumber;
          }
        })
      }
      if (product.brand && product.brand.name) {
        // Do not include brand name if product name has that brand name
        if (!product.name.match(new RegExp(product.brand.name, 'i'))) {
          fullText += ' ' + product.brand.name;
        }
      }
      if (product.tag_list && product.tag_list.length > 0) {
        fullText += ' ' + product.tag_list.map(x => x.name).join(' ');
      }
      fullText += '||' + product.name ?? '';
      let purchase_history = [];
      if (product.purchase_history) {
        for (const customerId in product.purchase_history) {
          purchase_history.push(+customerId);
        }
      }
      let productSet: any = {
        id: product._id,
        full_text: this.processKeyword(fullText),
        brand_id: product.brand_id ?? null,
        tag_id_list: product.tag_id_list ?? [],
        status: product.status,
        category_id: product.category_id,
        is_coop_xtra: product.is_coop_xtra,
        is_ecology: product.is_ecology,
        is_frozen: product.is_frozen,
        just_backend: product.just_backend ?? false,
        total_bought: product.total_bought ?? 0,
        order: product.order ?? 0, // TODO: Check necessary
        purchase_history
      };
      if (productSet.category_id && product.category_id.length > 0) {
        productSet.name_comp = {
          input: productSet.name,
          contexts: {
            category_id: productSet.category_id,
          }
        }
      }
      dataList.push({
        _id: product._id,
        ...productSet
      });
      elasticDataSet.push(productSet);
    });
    if (total === 1) {
      return await super.addIndex(dataList[0], collectionName);
    } else if (total > 1) {
      const res = await this.elasticSearch.bulk({ refresh: true, body: elasticDataSet });
      this.processElasticBulkResult(res, elasticDataSet);
    }
  }

  async deleteIndex(id) {
    await super.deleteIndex(id, collectionName);
  }

  async processFrozen(item) {
    let frozenCategory = await this.categoryService.findById(frozenCategoryId);
    let frozenCategoryIdList = [...frozenCategory.children];

    for (let i = 0; i < item.category_id.length; i++) {
      if (frozenCategoryIdList.includes(item.category_id[i])) {
        item.is_frozen = true;
        break;
      }
    }
    return item;
  }

  async updateTag(data) {
    let tagId = data.tag_id;
    let productId = data.product_id;
    let type = data.type;// 'add' | 'delete'
    let product = await this.findById(productId);
    if (product) {
      let result = null;
      if (type === 'delete') {
        result = await this.productsModel.updateOne({ _id: productId }, {
          $pull: {
            tag_id_list: tagId
          }
        });
      } else {
        result = await this.productsModel.updateOne({ _id: productId }, {
          $addToSet: {
            tag_id_list: tagId
          }
        });
      }
      if (result) {
        await this.indexElastic([product]);
        return {
          success: true
        }
      }
    }
    throw new BadRequestException('Ingen By fundet');
  }
}