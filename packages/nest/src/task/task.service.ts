import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { CounterService } from '../counter/counter.service';
import { ThumborService } from '../thumbor/thumbor.service';
import { NewspapersService } from '../newspapers/newspapers.service';
import { OffersService } from '../offers/offers.service';
import { CategoryService } from '../category/category.service';
import { StoresService } from '../stores/stores.service';
import { OrderService } from '../order/order.service';
import { getNow, convertUnixTime, generateSlug, randomNumber } from '../helper/general.helper';
import { ConfigService } from '@nestjs/config';
import { Task } from './task.schema';
import { MailQueue } from '../mail-send/mail-send.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { NUMBER_ROW_PER_PAGE, ELASTIC_INDEX, SPECIAL_PRODUCT_ID_LIST } from '../config/constants';
import BaseService from '../helper/base.service';
import { MongoClient } from "mongodb";
import { TaskDTO } from './task.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { processMail } from '../helper/send_mail_helper';
import { SettingService } from '../setting/setting.service';
import { OrderBakeryService } from '../order-bakery/order-bakery.service';
import { endOfDay, getUnixTime, startOfDay } from 'date-fns';
import { createPDF } from '../helper/pdf.helper';
import { docBakeryProducts } from '../template/template-bakery-product';
import { docBakeryProductsCustomerList } from '../template/template-bakery-product-customer-list';
import { cloneDeep } from 'lodash';
import { docBakeryProductsPackingSlip } from '../template/template-bakery-product-packing-slip';

const fs = require('fs');
const FormData = require('form-data');
const taskStatus = {
  Idle: 0,
  Pending: 1,
  Running: 2,
}
const MAX_RESULT_WINDOW_OVER_VALUE = 500;
@Injectable()
export class TaskService extends BaseService {
  constructor(
    configService: ConfigService,
    counterService: CounterService,
    private thumborService: ThumborService,
    private productService: ProductsService,
    private customerService: CustomersService,
    private newspaperService: NewspapersService,
    private offerService: OffersService,
    private categoryService: CategoryService,
    private storeService: StoresService,
    private orderService: OrderService,
    private orderBakeryService: OrderBakeryService,
    private mailService: MailService,
    private schedulerRegistry: SchedulerRegistry,
    private settingService: SettingService,
    private jwtService: JwtService,
    @InjectModel('Task') public readonly taskModel: Model<Task>,
    @InjectModel('MailQueue') public readonly mailQueueModel: Model<MailQueue>,
  ) {
    super(counterService, configService);
  }
  private readonly logger = new Logger(TaskService.name);
  private readonly collectionName = 'task';
  private logString = '';

  //yarn execute init
  async init() {
    await this.updatePurchaseHistory({ indexProduct: false });
    await this.createIndexProduct({});
    await this.createIndexCustomer();
    await this.resetCounter();
    await this.crawlProductDescription({});
  }

  //yarn execute initTest
  async initTest() {
    await this.init();
    await this.addSampleOrder();
    await this.addTestingQuickPayAccount();
    await this.processOffer({ current: true });
  }

  async log(content, logger = true) {
    this.logString += `${convertUnixTime(getNow())} - ${content}\n`;
    if (logger) {
      this.logger.debug(content);
    }
  }
  async saveLog(name, start_time, end_time, append = true) {
    const assetPath = this.configService.get<any>('assetsPath');
    let fileName = '';
    if (append) {
      fileName = name + '.log'
      let pathName = `${assetPath}/task_log/${fileName}`;
      try {
        fs.renameSync(pathName, pathName.replace('.log', '.bk.log'));
      } catch (e) {
        this.logError(e, 'task', __filename);
        console.log(e.message);
      }
      fs.writeFileSync(`${assetPath}/task_log/${fileName}`,
        this.logString + `\n${this.calculateTimeRunning(start_time)}`
      )
    } else {
      fileName = name + getNow() + '.log'
      fs.writeFileSync(`${assetPath}/task_log/${fileName}`,
        this.logString + `\n${this.calculateTimeRunning(start_time)}`
      )
    }
    let task = await this.taskModel.findOne({ name: name });
    if (task) {
      await this.updateById(task._id, {
        content: fileName,
        start_time: start_time,
        end_time: end_time
      }, this.taskModel);
    } else {
      const newTask = new this.taskModel({
        name: name,
        content: fileName,
        start_time: start_time,
        end_time: end_time
      });
      try {
        let result = this.save(newTask, this.collectionName);
      } catch (e) {
        this.logError(e, 'task', __filename);
        console.log(e);
      }
    }
    this.logString = '';
  }

  async sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  //yarn execute processOffer current=false
  async processOffer(params) {
    let logString = '';
    this.log('Start Update Offer, Product Status by newspaper');
    const now = getNow();
    //Process expired newspaper
    let newspaperListEndOfTime = await this.newspaperService.newspapersModel.find({
      to: { $lte: now },
      active: true
    }, { project: 0 }, { lean: true });
    if (newspaperListEndOfTime) {
      //set inactive
      let offerIdList = [];
      for (let i = 0; i < newspaperListEndOfTime.length; i++) {
        let newspaper = newspaperListEndOfTime[i];
        newspaper.offer_list.offer_id_list.forEach(x => { offerIdList = offerIdList.concat(x) });
      }
      await this.offerService.offerModel.updateMany({ _id: { $in: offerIdList } }, { $set: { active: false } });

      let productIdList = [];
      let offerList = await this.offerService.offerModel.find({ _id: { $in: offerIdList } });
      offerList.forEach(x => { productIdList = productIdList.concat(x.product_id_list); });
      if (productIdList.length > 0) {
        await this.productService.productsModel.updateMany({ _id: { $in: productIdList }, status: { $gte: 2 } }, { $inc: { status: -2 } });
        await this.productService.indexElastic(null, productIdList);
      }
      await this.newspaperService.newspapersModel.updateMany({ _id: { $in: newspaperListEndOfTime.map(x => x._id) } }, { $set: { active: false } });
      this.log('Inactivated newspaper, offer, product ended!');
    }
    //Process incomming active newspaper or current active newspaper
    let activeNewspaperList = await this.newspaperService.newspapersModel.find({
      from: { $lte: now },
      to: { $gte: now + 86400 }, // 0h tomorrow
      active: params.current ? true : false
    }, { project: 0 }, { lean: true });
    //active
    if (activeNewspaperList && activeNewspaperList.length > 0) {
      this.log(`Found ${activeNewspaperList.length} Activated newspaper!`);
      let offerIdList = [];

      for (let i = 0; i < activeNewspaperList.length; i++) {
        let newspaper = activeNewspaperList[i];
        newspaper.offer_list.offer_id_list.forEach(x => { offerIdList = offerIdList.concat(x); });
      }
      await this.offerService.offerModel.updateMany({ _id: { $in: offerIdList } }, { $set: { active: true } });
      let offerList = await this.offerService.offerModel.find({ _id: { $in: offerIdList } });

      let productIdList = [];
      offerList.forEach(x => { productIdList = productIdList.concat(x.product_id_list); });
      if (productIdList.length > 0) {
        await this.productService.productsModel.updateMany({ _id: { $in: productIdList }, status: { $lt: 2 } }, { $inc: { status: 2 } })
        await this.productService.indexElastic(null, productIdList);
      }
      await this.newspaperService.newspapersModel.updateMany({ _id: { $in: activeNewspaperList.map(x => x._id) } }, { $set: { active: true } });
      this.log('Activated newspaper, offer, product!');
    } else {
      this.log('Found 0 newspaper active!');
    }
    await this.saveLog('updateStatusOffer', now, getNow(), true);
    this.log('Done!')
  }

  //yarn execute updateProductAddStoreId storeId=1 setStoreList=true
  async updateProductAddStoreId(storeId, setStoreList = false) {
    let startTime = getNow();
    this.log('updateProductAddStoreId start');
    let productList = [];
    let updated = 0
    let total = await this.productService.productsModel.countDocuments();
    do {
      productList = await this.productService.findByCondition({}, null, { skip: updated, limit: 100, sort: { _id: 1 } });
      let bulkWriteList = [];
      productList.forEach(product => {
        let id = product._id;
        delete product._id;
        let newStorePriceList = product.store_price_list ? product.store_price_list : {};
        if (newStorePriceList[storeId]) {
          return;
        } else {
          newStorePriceList[storeId] = product.price;
        }
        bulkWriteList.push({
          'updateOne': {
            filter: {
              _id: +id
            },
            'update': {
              ...product,
              'store_price_list': newStorePriceList,
              'store_id_list': setStoreList ? (product.store_id_list ? [...product.store_id_list, storeId] : [storeId]) : product.store_id_list
            }
          }
        });
      });
      await this.productService.productsModel.bulkWrite(bulkWriteList);
      updated += productList.length;
      this.log(`Processed ${updated}/${total}`);
    } while (productList.length == 100);
    this.log(`Done!`);
    await this.saveLog('updateProduct', startTime, getNow());
  }

  //yarn execute updateProductAddStoreId storeId=all
  async updateProductAddAllStoreId() {
    let startTime = getNow();
    this.log('updateProductAddAllStoreId start');
    let storeList = await this.storeService.findAll({}, { _id: 1, name: 1 });
    let storeIdList = storeList.map(x => x._id);
    let productList = [];
    let updated = 0
    let total = await this.productService.productsModel.countDocuments();
    this.log(`Total product: ${total}!`);
    do {
      productList = await this.productService.findByCondition({}, { _id: 1, price: 1, name: 1 }, { skip: updated, limit: 100, sort: { _id: 1 } });
      let bulkWriteList = [];
      productList.forEach(product => {
        let storePriceList = storeList.reduce((acc: any, cur: any, i: number) => {
          if (acc.name) {
            acc = { [acc._id]: product.price };
          }
          acc[cur._id] = product.price;
          return acc;
        });
        bulkWriteList.push({
          'updateOne': {
            filter: {
              _id: +product._id
            },
            'update': {
              'store_price_list': storePriceList,
              'store_id_list': storeIdList,
              'slug': generateSlug(product.name ?? ''),
            }
          }
        });
      });
      await this.productService.productsModel.bulkWrite(bulkWriteList);
      updated += productList.length;
      this.log(`Processed ${updated}/${total}`);
    } while (productList.length == 100);
    this.log(`Done!`);
    await this.saveLog('updateProduct', startTime, getNow());
  }

  //yarn execute indexProduct
  async indexProduct(params) {
    let startTime = getNow();
    this.log('indexProduct start');
    let productList = [];
    let skip = 0;
    let limit = params.limit ? +params.limit : 1000;
    const skipIdList = [133062];
    let maxIdProduct = await this.productService.findOneByCondition({}, null, { sort: { _id: -1 } });
    let maxResultWindow = (await this.productService.productsModel.countDocuments()) + MAX_RESULT_WINDOW_OVER_VALUE;
    await this.elasticSearch.indices.putSettings({
      index: ELASTIC_INDEX.product,
      body: {
        max_result_window: maxResultWindow
      }
    })
    let lastProductId = 0;
    do {
      productList = await this.productService.findByCondition({ _id: { $gt: lastProductId } }, null, { limit: limit, sort: { _id: 1 } });
      await this.productService.indexElastic(productList);
      lastProductId = productList[productList.length - 1]._id;

      skip += productList.length;
      this.log(`Processed ${skip}`);
    } while (lastProductId < maxIdProduct._id);

    this.log('Done!');
    await this.saveLog('indexProduct', startTime, getNow(), true);
  }

  //yarn execute createIndexProduct index=false
  async createIndexProduct(params) {
    try {
      await this.elasticSearch.indices.delete({
        index: ELASTIC_INDEX.product
      });
    } catch (e) {
      this.logError(e, 'task', __filename);
      if (e.message.indexOf('index_not_found_exception') > -1) {
        console.log(e.message);
      } else {
        console.log(e.message);
        return;
      }
    }
    this.logger.debug(`Deleted Index Product`);
    let maxResultWindow = (await this.productService.productsModel.countDocuments()) + MAX_RESULT_WINDOW_OVER_VALUE;
    try {
      await this.elasticSearch.indices.create({
        index: ELASTIC_INDEX.product,
        body: {
          settings: {
            "number_of_shards": 1,
            "number_of_replicas": 0,
            "analysis": {
              "analyzer": {
                "my_analyzer": {
                  "type": "custom",
                  "tokenizer": "my_tokenizer",
                  "filter": [
                    "lowercase"
                  ]
                }
              },
              "tokenizer": {
                "my_tokenizer": {
                  "type": "ngram",
                  "min_gram": 3,
                  "max_gram": 3,
                  "token_chars": [
                    "letter",
                    "digit",
                    "whitespace"
                  ]
                }
              }
            },
            "index": {
              "similarity": {
                "my_similarity": {
                  "type": "BM25",
                  "k1": 1.2,
                  "b": 0
                }
              },
              "max_result_window": maxResultWindow
            }
          },
          "mappings": {
            "properties": {
              "id": {
                "type": "long",
                "index": true
              },
              "full_text": {
                "type": "text",
                "analyzer": "my_analyzer"
              },
              "status": {
                "type": "long",
                "index": true
              },
              "total_bought": {
                "type": "long",
                "index": true
              },
              "order": {
                "type": "long",
                "index": true
              },
              "is_coop_xtra": {
                "type": "boolean",
                "index": true
              },
              "is_ecology": {
                "type": "boolean",
                "index": true
              },
              "is_frozen": {
                "type": "boolean",
                "index": true
              },
              "just_backend": {
                "type": "boolean",
                "index": true
              },
              "brand_id": {
                "type": "long",
                "index": true
              },
              "tag_id_list": {
                "type": "long",
                "index": true
              },
              "purchase_history": {
                "type": "long",
                "index": true
              },
              "name_comp": {
                "type": "completion",
                "analyzer": "my_analyzer",
                "contexts": [
                  {
                    "name": "category_id",
                    "type": "category",
                    "path": "cat"
                  }
                ]
              }
            }
          }
        }
      });

      this.logger.debug(`Created Index Product`);
      if (params.index && params.index === 'false') {
        return;
      }

      await this.indexProduct({});
    } catch (e) {
      console.log(e);
      this.logError(e, 'task', __filename);
      return;
    }
  }

  async indexCustomer(params) {
    let startTime = getNow();
    this.log('indexCustomer start');
    let customerList = [];
    let skip = 0;
    let limit = params.limit ? +params.limit : 1000;
    let maxIdCustomer = await this.customerService.findOneByCondition({}, null, { sort: { _id: -1 } });

    let maxResultWindow = (await this.customerService.customersModel.countDocuments()) + MAX_RESULT_WINDOW_OVER_VALUE;
    await this.elasticSearch.indices.putSettings({
      index: ELASTIC_INDEX.customer,
      body: {
        max_result_window: maxResultWindow
      }
    })
    let lastCustomerId = 0;
    do {
      customerList = await this.customerService.findByCondition({ _id: { $gt: lastCustomerId } }, null, { limit: limit, sort: { _id: 1 } });
      await this.customerService.indexElastic(customerList);
      lastCustomerId = customerList[customerList.length - 1]._id;

      skip += customerList.length;
      this.log(`Processed ${skip}`);
    } while (lastCustomerId < maxIdCustomer._id);

    this.log('Done!');
    await this.saveLog('indexCustomer', startTime, getNow(), true);
  }

  async createIndexCustomer() {
    try {
      await this.elasticSearch.indices.delete({
        index: ELASTIC_INDEX.customer
      });
    } catch (e) {
      this.logError(e, 'task', __filename);
      if (e.message.indexOf('index_not_found_exception') > -1) {
        console.log(e.message);
      } else {
        console.log(e.message);
        return;
      }
    }
    this.logger.debug(`Deleted Index Customer`);
    let maxResultWindow = (await this.customerService.customersModel.countDocuments()) + MAX_RESULT_WINDOW_OVER_VALUE;
    try {
      await this.elasticSearch.indices.create({
        index: ELASTIC_INDEX.customer,
        body: {
          settings: {
            "number_of_shards": 1,
            "number_of_replicas": 0,
            "analysis": {
              "analyzer": {
                "my_analyzer": {
                  "type": "custom",
                  "tokenizer": "my_tokenizer",
                  "filter": [
                    "lowercase"
                  ]
                }
              },
              "tokenizer": {
                "my_tokenizer": {
                  "type": "ngram",
                  "min_gram": 2,
                  "max_gram": 3,
                  "token_chars": [
                    "letter",
                    "digit",
                    "whitespace"
                  ]
                }
              }
            },
            "index": {
              "similarity": {
                "my_similarity": {
                  "type": "BM25",
                  "k1": 1.2,
                  "b": 0
                }
              },
              "max_result_window": maxResultWindow
            }
          },
          "mappings": {
            "properties": {
              "name": {
                "type": "text",
                "analyzer": "my_analyzer"
              }
            }
          }
        }
      });

      this.logger.debug(`Created Index Customer`);
      await this.indexCustomer({})
    } catch (e) {
      this.logError(e, 'task', __filename);
      console.log(e);
      return;
    }
    ;
  }

  //yarn execute uploadProductImg
  async uploadProductImg() {
    let startTime = getNow();
    this.log('uploadProductImg start');
    const THUMBOR_SERVER_API = this.configService.get<any>('thumborServer') + '/api';
    const assetPath = this.configService.get<any>('assetsPath');
    const AUTH_KEY = this.configService.get<any>('thumborToken');

    const readFiles = (dirname, onFileContent) => {
      fs.readdir(dirname, async (err, filenames) => {
        if (err) {
          console.log(err);
          this.log(err.message);
          return;
        }
        for (let i = 0; i < filenames.length; i++) {
          const filename = filenames[i];
          // const content = fs.readFileSync(dirname + filename);
          await onFileContent(dirname + filename, filename.split('-')[0]);
        }
        console.log('Done!');
        this.log('Done!');
      });
    }
    readFiles(assetPath + '/product_image/', async (filename, productId) => {
      let data = new FormData();
      data.append('files', fs.createReadStream(filename));
      data.append('compress', 0);
      await axios.post(THUMBOR_SERVER_API, data, {
        headers: {
          ...data.getHeaders(),
          Authorization: `Bearer ${AUTH_KEY}`
        }
      }).then(async response => {
        if (response.data.has_error) {
          console.log({
            'filename': filename,
            'error_in': 'Call api Thumbor',
            'error_message': response.data
          });
          this.log(`${filename} | Call api Thumbor failed! | ${response.data}`);
        } else {
          await this.productService.update(productId, {
            image: response.data.image_location.replace('/', '')
          });
        }
      }).catch(error => {
        this.logError(error, 'task', __filename);
        console.log({
          'filename': filename,
          'error_in': 'Call api Thumbor',
          'error_message': error.message
        });
        this.log(`${filename} | Call api Thumbor failed! | ${error.message}`);
      });
    })
    this.logger.log('Done!');
    this.log(`Done!`);
    await this.saveLog('uploadProductImg', startTime, getNow());
  }

  //yarn execute uploadCategoryImg
  async uploadCategoryImg() {
    let startTime = getNow();
    const assetPath = this.configService.get<any>('assetsPath');
    this.log('uploadCategoryImg start');
    const THUMBOR_SERVER_API = this.configService.get<any>('thumborServer') + '/api';
    const AUTH_KEY = this.configService.get<any>('thumborToken');
    const THUMBOR_STORAGE_PATH = this.configService.get<any>('thumborStoragePath');
    const CopyDir = async (src) => {
      let fileNames = fs.readdirSync(src);
      fileNames.forEach(fileName => {
        fs.copyFileSync(`${src}/${fileName}`, `${THUMBOR_STORAGE_PATH}/00/${fileName}`)
      })
    }
    this.log('start update Category')
    let uuidList = JSON.parse(fs.readFileSync(assetPath + '/category_image/uuid_list.json').toString());
    for (let i = 0; i < uuidList.length; i++) {
      let { uuid, categoryId } = uuidList[i];
      await this.categoryService.updateOne({
        _id: +categoryId,
        img: uuid,
      }, { username: 'admin' });
    }
    this.log('start copy image dir');
    await CopyDir(assetPath + '/category_image/00');
    this.logger.log('Done!');
    this.log('Done!');
    await this.saveLog('uploadCategoryImg', startTime, getNow());
  }

  //yarn execute addSampleOrder
  async addSampleOrder() {
    const assetPath = this.configService.get<any>('assetsPath');
    this.log('addSampleOrder start');
    let orderList = JSON.parse(fs.readFileSync(assetPath + '/order/order.sample.json').toString());
    this.log('Total sample order: ' + orderList.length);
    await this.orderService.orderModel.deleteMany({ _id: { '$in': orderList.map(e => e._id) } });
    await this.orderService.orderModel.insertMany(orderList);
    this.log(`Done!`);
  }

  //yarn execute removeSampleOrder
  async removeSampleOrder() {
    const assetPath = this.configService.get<any>('assetsPath');
    this.log('removeSampleOrder start');
    let orderList = JSON.parse(fs.readFileSync(assetPath + '/order/order.sample.json').toString());
    await this.orderService.orderModel.deleteMany({ _id: { '$in': orderList.map(e => e._id) } });
    this.log(`Done!`);
  }

  async find(query) {
    if (!!query._id) {
      return {
        task_list: await this.taskModel.find({ _id: parseInt(query._id) }, { projection: 0 }, { limit: 1 }).exec()
      }
    }
    let { limit = NUMBER_ROW_PER_PAGE, page = 1 } = query;
    page = +page; limit = +limit

    let condition: any = {};
    for (const key in query) {
      if (query[key] == null) {
        continue;
      }
      switch (key) {
        case 'page':
        case 'limit': break;
        case 'start_time':
        case 'end_time': {
          let date = new Date(+query[key] * 1000);
          if (date) {
            condition[key] = {
              $gte: getUnixTime(startOfDay(date)),
              $lte: getUnixTime(endOfDay(date)),
            }
          }
          break;
        }
        case 'status': {
          condition[key] = +query[key];
          break;
        }
        default: condition[key] = new RegExp(query[key], 'ui');
      }
    }

    let options = {
      sort: { _id: -1 },
      limit,
      skip: (page - 1) * limit
    };
    let taskList = await this.taskModel.find(condition, { projection: 0 }, options).exec();
    if (page === 1) {
      const total = await this.taskModel.countDocuments(condition);
      return {
        task_list: taskList,
        total,
      }
    }
    return {
      task_list: taskList,
    };
  }

  async getLog(fileName, res) {
    const assetPath = this.configService.get<any>('assetsPath');
    const filePath = `${assetPath}/task_log/${fileName}`;
    if (fs.existsSync(filePath)) {
      // res.set('Content-type', "application/octet-stream");
      // res.set('Content-disposition', 'attachment; filename=pbsfile.txt');
      res.headers({
        ...res.getHeaders(),
        'Content-type': "text/plain",
      });
      res.send(fs.readFileSync(filePath, 'utf-8').toString())
      // return fs.readFileSync(filePath, 'utf-8').toString();
    }
    throw new BadRequestException('Ingen By fundet');
  }

  // yarn execute updateMostBought 
  async updateMostBought(params) {
    let startTime = getNow();
    const MOST_BOUGHT_LIMIT = 50;
    this.log('updateProductAddAllStoreId start');

    let limit = params.limit ? +params.limit : 100;
    let maxIdCustomer = await this.customerService.findOneByCondition({ active: true }, null, { sort: { _id: -1 } });
    let total = await this.customerService.customersModel.countDocuments({ active: true });
    this.log(`Total customer active: ${total}!`);
    let skip = 0;
    let lastCustomerId = 0;

    do {
      let customerList = await this.customerService.findByCondition({ _id: { $gt: lastCustomerId }, active: true }, { _id: 1 }, { limit, sort: { _id: 1 } });
      let customerIdList = customerList.map(x => x._id);
      let orderCustomerList = await this.orderService.orderModel.aggregate([
        { $match: { customer_id: { $in: customerIdList } } },
        { $project: { customer_id: 1, product_list: 1 } },
        { $group: { _id: "$customer_id", order_list: { $push: "$$ROOT" } } }
      ]);
      let bulkWriteList = [];
      //process and update customer
      for (let i = 0; i < orderCustomerList.length; i++) {
        let orderCustomer = orderCustomerList[i];
        let productMap: any = {};
        orderCustomer.order_list.forEach(order => {
          order.product_list.forEach(product => {
            if (product._id && !SPECIAL_PRODUCT_ID_LIST.includes(product._id)) {
              if (productMap[product._id]) {
                productMap[product._id] += product.quantity;
              } else {
                productMap[product._id] = product.quantity;
              }
            }
          });
        });
        let mostBoughtIdList = [];
        if (Object.keys(productMap).length > MOST_BOUGHT_LIMIT) {
          let sortedProductList = [];
          for (let key in productMap) {
            sortedProductList.push([key, productMap[key]]);
          }
          sortedProductList.sort((a, b) => { return b[1] - a[1]; });

          for (let j = 0; j < MOST_BOUGHT_LIMIT; j++) {
            if (typeof sortedProductList[j] == 'undefined') {
              break;
            }
            mostBoughtIdList.push(parseInt(sortedProductList[j][0]));
          }
        } else {
          mostBoughtIdList = Object.keys(productMap).map(x => parseInt(x));
        }
        bulkWriteList.push({
          'updateOne': {
            filter: {
              _id: orderCustomer._id
            },
            'update': {
              most_bought_list: mostBoughtIdList
            }
          }
        });
      }
      await this.customerService.customersModel.bulkWrite(bulkWriteList);
      lastCustomerId = customerList[customerList.length - 1]._id;
      skip += customerList.length;
      this.log(`Processed ${skip}`);
    } while (lastCustomerId < maxIdCustomer._id);

    this.log('Done!');
    await this.saveLog('indexProduct', startTime, getNow());
  }

  async resetCounter() {
    let startTime = getNow();
    this.log('resetCounter start');
    const mongoUri = this.configService.get<any>('database.uri');
    const mongoDbName = this.configService.get<any>('database.name');
    let client = await MongoClient.connect(mongoUri, { useUnifiedTopology: true })
    let db: any = await client.db(mongoDbName);
    let collectionNameList = (await db.listCollections().toArray()).map(x => x.name);
    let bulkWriteList = [];

    for (let i = 0; i < collectionNameList.length; i++) {
      let collectionName = collectionNameList[i];
      if (collectionName == 'counter') {
        continue;
      }
      let max_id = (await db.collection(collectionName).find().sort({ _id: -1 }).limit(1).toArray())[0]?._id ?? 0;
      if (collectionName == 'customer' && max_id < 40000) {
        max_id = 39999;
      }
      let total = await db.collection(collectionName).countDocuments();
      bulkWriteList.push({
        'updateOne': {
          filter: {
            _id: collectionName,
          },
          'update': {
            max_id,
            total
          }
        }
      });
      this.log(`${collectionName}\t${max_id}\t${total}`);
    }
    await this.counterService.counterModel.bulkWrite(bulkWriteList);
    await this.saveLog('resetCounter', startTime, getNow());
    this.log('Done!');
  }
  async addTestingQuickPayAccount() {
    let quickPayInfo = {
      8: { // Superbrugsen Nykøbing Sj.
        "secret": "f2493eefe28766df14fb148554f33fec2ac60bb71156b2b280b5a7bec1a26256",
        "secret_key_account": "egebjerg.store.1@hotmail.com",
        "api_key": "03710f1cb284b15b316cdd12b89ac3ceedb8ffbc33007e895039e604da2e9457",
        "agreement_id": "571703",
        "merchant": "139427",
        "card_type": null
      },
      10: { // Superbrugsen Lynge
        "secret": "06ab25f6325a718c56eac5a9525110f0fbb4288ec60df81a1e98bad277689ff5",
        "secret_key_account": "egebjerg.store.2@outlook.com",
        "api_key": "9426b0824effb0f94a3d37029a78fedaa74f863a685f9c3ca6b4d1c1c7df492a",
        "agreement_id": "571795",
        "merchant": "139441",
        "card_type": null
      }
    };
    for (const storeId in quickPayInfo) {
      await this.storeService.storeModel.updateOne({
        _id: +storeId
      }, {
        $set: {
          quickpay_info: quickPayInfo[storeId]
        }
      })
    }
    this.log('resetQuickPay done!');
  }

  calculateTimeRunning(startTime) {
    let timeRunning = 0;
    if (startTime > 0) {
      timeRunning = getNow() - startTime;
    } else {
      return `${convertUnixTime(getNow())} done!`;
    }
    let timeRunningDetail = timeRunning > 3600 ? Math.round(timeRunning / 3600) + ' hours' : Math.round(timeRunning / 60) + ' minutes';
    return `${convertUnixTime(getNow())} done! ${timeRunning} seconds - (${timeRunningDetail})`;
  }

  //yarn execute updatePurchaseHistory customerId=1 indexProduct=true
  async updatePurchaseHistory(params) {
    let startTime = getNow();
    this.log('resetCounter start');
    let condition: any = {
      active: true
    };
    if (params.customerId) {
      condition.customer_id = +params.customerId;
    }
    let limit = params.limit ? +params.limit : 1000;

    let maxCustomerId = (await this.customerService.customersModel.find(condition, { _id: 1 }, { sort: { _id: -1 }, limit: 1, lean: true }))[0]?._id ?? 0;
    let total = await this.customerService.customersModel.countDocuments(condition);
    let lastCustomerId = 0;
    let updated = 0;
    this.log('Process customers\'s orders');
    do {
      condition._id = {
        $gt: lastCustomerId
      }
      let customerList = await this.customerService.customersModel.find(condition, { _id: 1 }, { sort: { _id: 1 }, limit: limit, lean: true });
      let customerIdList = customerList.map(x => x._id);
      let orderCustomerList = await this.orderService.orderModel.aggregate([
        { $match: { customer_id: { $in: customerIdList } } },
        { $project: { customer_id: 1, product_list: 1 } },
        { $group: { _id: "$customer_id", order_list: { $push: "$$ROOT" } } }
      ]);
      for (let i = 0; i < orderCustomerList.length; i++) {
        let orderCustomer = orderCustomerList[i];
        let bulkWriteList = [];
        let purchaseCountMap: any = {};

        orderCustomer.order_list.forEach(order => {
          if (order.product_list) {
            order.product_list.forEach(product => {
              if (product._id) {
                if (purchaseCountMap[product._id]) {
                  purchaseCountMap[product._id] += product.quantity;
                } else {
                  purchaseCountMap[product._id] = product.quantity;
                }
              }
            })
          }
        })

        for (const productId in purchaseCountMap) {
          bulkWriteList.push({
            'updateOne': {
              filter: {
                _id: productId,
              },
              'update': {
                [`purchase_history.${orderCustomer._id}`]: purchaseCountMap[productId],
              }
            }
          });
        }
        await this.productService.productsModel.bulkWrite(bulkWriteList);
      };
      lastCustomerId = customerIdList[customerIdList.length - 1];
      updated += customerIdList.length;
      this.log(`Processed ${updated}/${total}`);
    } while (lastCustomerId < maxCustomerId);

    if (params.indexProduct) {
      await this.indexProduct({});
      this.log(`Reindex product`);
    }

    await this.saveLog('updatePurchaseHistory', startTime, getNow());
    this.log('Done!');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async mainTask() {
    let dateNow = new Date();
    let day = dateNow.getDay();
    let hour = dateNow.getHours();
    let now = getNow();
    let task = await this.taskModel.findOneAndUpdate({
      'config.start_time': { $lte: hour },
      'config.end_time': { $gte: hour },
      'config.day_cycle': day,
      $expr: { $lte: [{ $add: [{ $multiply: ["$config.time_cycle", 60] }, '$end_time'] }, now] },
      status: taskStatus.Idle
    }, {
      $set: {
        status: taskStatus.Pending
      }
    }, { lean: true, new: true });
    if (task) {
      await this.updateById(task._id, {
        status: taskStatus.Running,
        start_time: getNow()
      }, this.taskModel)
      await this[task.name]({});
      await this.updateById(task._id, {
        status: taskStatus.Idle,
        end_time: getNow()
      }, this.taskModel);
    }
  }

  async create(task: TaskDTO) {
    let taskCheck = await this.taskModel.findOne({ name: task.name });
    let result = null;
    if (taskCheck) {
      result = this.updateById(taskCheck._id, task, this.taskModel)
    } else {
      const newTask = new this.taskModel({
        ...task,
        start_time: null,
        end_time: null,
        status: 0
      });
      result = this.save(newTask, this.collectionName);
    }
    return result;
  }

  async update(_id: number, data) {
    if (!!data._id) {
      delete data._id;
    }
    let task = await this.taskModel.findOne({ _id });
    if (task) {
      return this.updateById(_id, data, this.taskModel)
    }
    throw new BadRequestException('Ingen By fundet');
  }

  //yarn execute generateThumborToken
  async generateThumborToken() {
    let user = {
      "_id": 9999,
      "username": "thumbor",
      "name": "Thumbor",
      "user_group_id": 1,
      "permission": {
        "product": "11111"
      }
    }
    let thumborToken = this.jwtService.sign(user);
    console.log('New Thumbor Token:\n', thumborToken);
  }

  //TODO: Remove when convert complete
  //yarn execute processOrderStoreId
  async processOrderStoreId(params) {
    let startTime = getNow();
    this.log('processOrderStoreId start');
    let customerList = [];
    let skip = 0;
    let limit = params.limit ? +params.limit : 1000;
    let maxIdCustomer = await this.customerService.findOneByCondition({}, null, { sort: { _id: -1 } });
    let lastCustomerId = 0;
    let dataSet = [];
    let storeMap: any = {};
    let storeList = await this.storeService.storeModel.find({}, { name: 1 });
    storeList.forEach(x => {
      storeMap[x._id] = x;
    });
    do {
      customerList = await this.customerService.findByCondition({ _id: { $gt: lastCustomerId } }, null, { limit: limit, sort: { _id: 1 } });
      for (let i = 0; i < customerList.length; i++) {
        let customer = customerList[i];
        lastCustomerId = customer._id;
        await this.orderService.orderModel.updateMany({ customer_id: customer._id }, {
          $set: {
            store: storeMap[customer.store_id] ?? null
          }
        })
      }
      skip += customerList.length;
      this.log(`Processed ${skip}`);
    } while (lastCustomerId < maxIdCustomer._id);
    this.log('Done!');
    await this.saveLog('processOrderStoreId', startTime, getNow(), true);
  }

  //yarn execute crawlProductDescription
  async crawlProductDescription(params) {
    const assetPath = this.configService.get<any>('assetsPath');

    const processHTMLUpdateProduct = async (HTML, productId) => {
      let description = '';
      let nutrition = '';

      let isNoInfo = HTML.match(new RegExp('<div class="nutritional-table" style=\'display: none;\'>', 's'));
      if (isNoInfo) {
        return null;
      }

      let matchDescription = HTML.match(new RegExp('<div[^>]*class="ingedients"[^>]*>\\s*<h3.+?h3>\\s*(<p>.+?</p>)\\s+</div>', 's'));
      let matchNutrition = HTML.match(new RegExp('<div[^>]*class="nutritional-table"[^>]*>\\s*(<table[^>]*>.+?</table>).*?</div>', 's'));
      if (matchDescription) {
        description = matchDescription[1];
      }
      if (matchNutrition) {
        nutrition = matchNutrition[1];
        //style table nutrition
        nutrition = nutrition.replace(/<table class="price-table">/, '<table class="info-table">');
        nutrition = nutrition.replace(/<tr[^>]*>/g, '<tr style="display:table-cell;">');
        nutrition = nutrition.replace(/<th>/g, '<th style="display:block;">');
      }
      await this.productService.productsModel.updateOne({ _id: productId }, {
        $set: {
          description: description + nutrition
        }
      });
      return description + nutrition;
    }

    let startTime = getNow();
    this.log('crawlDescriptionProduct start');
    let productList = [];
    let skip = 0;
    let limit = params.limit ? +params.limit : 1000;
    let maxIdProduct = await this.productService.findOneByCondition({ barcode: { $ne: null } }, null, { sort: { _id: -1 } });
    let total = await this.productService.productsModel.countDocuments({ barcode: { $ne: null } });
    let countProcessed = 0;
    let countSuccess = 0;
    let countError = 0;
    let count404 = 0;
    let countNoInfo = 0;
    let countOtherErrors = 0;
    let lastProductId = 0;
    let chunkSize = params.chunk_size ? +params.chunk_size : 10;

    let filePath404 = `${assetPath}/product_description/404.txt`;
    let filePathNoInfo = `${assetPath}/product_description/_NoInfo.txt`;
    let filePathOtherErrors = `${assetPath}/product_description/otherErrors.txt`;

    let barCodeList404 = {};
    if (fs.existsSync(filePath404)) {
      let list = fs.readFileSync(filePath404).toString().split('\n');
      list.forEach(productId => {
        barCodeList404[productId] = 1;
      });
    }

    let noInfoList = [];
    if (fs.existsSync(filePathNoInfo)) {
      let list = fs.readFileSync(filePathNoInfo).toString().split('\n');
      list.forEach(productId => {
        noInfoList[productId] = 1;
      });
    }

    if (fs.existsSync(filePathOtherErrors)) {
      fs.writeFileSync(filePathOtherErrors, '');
    }

    do {
      productList = await this.productService.findByCondition({ barcode: { $ne: null }, _id: { $gt: lastProductId } }, { barcode: 1 }, { limit: limit, sort: { _id: 1 } });
      for (let i = 0; i < productList.length; i += chunkSize) {
        let promiseList = [];
        for (let j = 0; j < chunkSize; j++) {
          let product = productList[i + j];
          if (!product) {
            continue;
          }
          if (!product.barcode) {
            countSuccess++;
            continue;
          }

          let barcode = product.barcode.replace(/-11$/, '');
          if (typeof barCodeList404[product._id] !== 'undefined') {
            count404++;
            countError++;
            continue;
          }

          if (typeof noInfoList[product._id] !== 'undefined') {
            countNoInfo++;
            countError++;
            continue;
          }

          let fileName = `${assetPath}/product_description/${product._id}_${barcode}.html`;
          if (fs.existsSync(fileName)) {
            const description: any = fs.readFileSync(fileName).toString();
            await this.productService.productsModel.updateOne({ _id: product._id }, {
              $set: {
                description: description
              }
            });
            countSuccess++;
          } else {
            let url = `https://beepr.dk/catalog/${barcode}.html`;
            let promise = axios.get(url)
              .then(async response => {
                let HTML = response.data;
                let description = await processHTMLUpdateProduct(HTML, product._id);
                if (description === null) {
                  countNoInfo++;
                  countError++;
                  fs.appendFileSync(filePathNoInfo, `\n${product._id}`);
                } else {
                  fs.writeFileSync(fileName, description);
                  countSuccess++;
                }
              }).catch(error => {
                if (error?.response?.status != 404) {
                  countOtherErrors++;
                  console.log(`Product ${product._id} : ${product.barcode}`);
                  fs.appendFileSync(filePathOtherErrors, `\n${product._id}`);
                  console.log(error);
                } else {
                  count404++;
                  fs.appendFileSync(filePath404, `\n${product._id}`);
                }
                countError++;
              })
            promiseList.push(promise);
          }
        }
        await Promise.all(promiseList);
        countProcessed += chunkSize;
        this.log(`Success: ${countSuccess} | 404: ${count404} - NoInfo: ${countNoInfo} - Other: ${countOtherErrors} | Processed: ${countProcessed} | Total: ${total}`);
      }
      lastProductId = productList[productList.length - 1]._id;

      skip += productList.length;
      this.log(`Processed ${skip}`);
    } while (lastProductId < maxIdProduct._id);

    this.log('Done!');
    await this.saveLog('indexProduct', startTime, getNow(), true);
  }

  // yarn execute sendMail
  async sendMail() {
    const shopDomain = this.configService.get('shopDomain');
    let startTime = getNow();
    this.log('sendMail start');
    let mailList = await this.mailQueueModel.find({ is_sent: false });
    let mailSentIdList = [];
    let mailPatternList = await this.mailService.findAll();
    for (let i = 0; i < mailList.length; i++) {
      let mail = mailList[i];
      let customer = (await this.customerService.findByCondition({ _id: mail.customer_id }, null, { lean: true, limit: 1 }))[0] ?? null;
      let customerHomeHelper = (await this.customerService.findByCondition({ _id: mail.home_helper_id }, null, { lean: true, limit: 1 }))[0] ?? null;
      let order = (await this.orderService.findByCondition({ _id: mail.order_id ?? null }, null, { lean: true, limit: 1 }))[0] ?? null;
      let store = (await this.storeService.findById(order?.store._id)) ?? null;
      let settings = (await this.settingService.findAll());
      let mailPattern = mailPatternList.find(x => x._id === mail.mail_id);
      if (mailPattern && customer && customerHomeHelper) {
        let mailSendList = await processMail(mailPattern, { customer, customerHomeHelper, order, store, settings }, shopDomain);
        if (mailSendList) {
          let result = true;
          for (let i = 0; i < mailSendList.length; i++) {
            result = result && await this.mailService.sendMail(mailSendList[i].subject, mailSendList[i].content, mailSendList[i].emailTo);
          }
          if (result) {
            mailSentIdList.push(mail._id);
            this.log(`Sent mail ${mail._id}`);
          }
        }
      }
    }
    if (mailSentIdList.length > 0) {
      await this.mailQueueModel.updateMany({ _id: { $in: mailSentIdList }, }, {
        $set: {
          is_sent: true,
          date: getNow()
        }
      });
    }
    await this.saveLog('sendMail', startTime, getNow(), true);
    this.log('Done!');
  }

  // yarn execute sendMailToBakery
  async sendMailToBakery() {
    let startTime = getNow();
    this.log('sendMailToBakery start');
    let storeList = await this.storeService.findAll({}, { _id: 1, bakery_email: 1, });
    const now = new Date();
    now.setHours(16, 0, 0, 0);
    let condition: any = {
      date: {
        $gte: getUnixTime(now) - 86400,
        $lt: getUnixTime(now),
      },
    };
    const settings = await this.settingService.findAll()
    for (let i = 0; i < storeList.length; i++) {
      const store = storeList[i];
      if (store.bakery_email) {
        condition.store_id = store._id;
        let orderBakeryList = await this.orderBakeryService.findAll(condition);

        if (orderBakeryList.length) {
          const mail = {
            subject: `Butikken du lige har bestilt ${convertUnixTime(getUnixTime(now), 'dd/MM/yyyy')}`,
            content: {
              attachments: [],
            },
            emailTo: store.bakery_email,
          };
          // create bakery product customer list
          let tmpList = orderBakeryList.filter(prod => prod.is_bakery);
          mail.content.attachments.push({
            filename: `Bageri_produkter_kunde_liste_${convertUnixTime(getUnixTime(now), 'ddMMyyyy')}.pdf`,
            path: await createPDF(docBakeryProductsCustomerList(tmpList)),
          });
          // create bakery product 
          let mapList = {};
          tmpList.forEach((orderBakery) => {
            if (mapList[orderBakery.product_id]) {
              mapList[orderBakery.product_id].quantity += orderBakery.quantity;
            } else {
              mapList[orderBakery.product_id] = cloneDeep(orderBakery);
            }
          });
          tmpList = Object.values(mapList);
          mail.content.attachments.push({
            filename: `Bageriprodukter_${convertUnixTime(getUnixTime(now), 'ddMMyyyy')}.pdf`,
            path: await createPDF(docBakeryProducts(tmpList)),
          });
          // create paking slip
          let orderList = await this.orderService.findAllOrderBakery({ date: condition.date, 'store._id': condition.store_id, });
          if (orderList.length) {
            mail.content.attachments.push({
              filename: `Bageri_ProdukterPackingSlips_${convertUnixTime(getUnixTime(now), 'ddMMyyyy')}.pdf`,
              path: await createPDF(docBakeryProductsPackingSlip(orderList, settings)),
            });
          }
          // send mail
          let result = await this.mailService.sendMail(mail.subject, mail.content, mail.emailTo);

          if (result) {
            this.log(`Sent success to store id ${store._id}`);
          } else {
            this.log(`Sent fail to store ${store._id}`);
          }
        }
      }
    }

    await this.saveLog('sendMail', startTime, getNow(), true);
    this.log('Done!');
  }
}