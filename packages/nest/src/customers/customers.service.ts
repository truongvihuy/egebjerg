import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from './customers.schema';
import { CustomersDTO } from './customers.dto';
import { Model } from 'mongoose';
import { CounterService } from '../counter/counter.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { NUMBER_ROW_PER_PAGE, ELASTIC_INDEX, TRANSACTION_TYPE } from '../config/constants';
import { ProductsService } from '../products/products.service';
import { updateFirebase } from '../helper/firebase-helper';
import { getNow } from '../helper/time.helper';
import BaseService from '../helper/base.service';
import { isFreeNameProduct } from '../helper/general.helper';
import { Transaction } from '../transaction/transaction.schema';

const collection = 'customer';
const MSG_DUPLICATE_PHONE_ADDRESS_CUSTOMER = 'Eksisterende telefonnummer eller navn, adresse, postnummer er duplikat';
const customerTypeMap = {
  normal: 1,
  admin: 2,
}
@Injectable()
export class CustomersService extends BaseService {
  constructor(
    counterService: CounterService,
    configService: ConfigService,
    private productService: ProductsService,
    @InjectModel('Customers') public readonly customersModel: Model<Customer>,
    @InjectModel('Transaction') private readonly transactionModel: Model<Transaction>
  ) {
    super(counterService, configService);
  }

  private readonly collectionName = 'customer'

  async findOneByCondition(condition: any, projection = null, option = null): Promise<Customer> {
    return await this.customersModel.findOne(condition, projection, option);
  }

  async findByCondition(condition, projection = {}, option: any = {}): Promise<any[]> {
    let customerList = await this.customersModel.aggregate([
      {
        $match: condition ?? {}
      }, {
        $sort: option.sort ?? { _id: 1 }
      }, {
        $skip: option.skip ?? 0
      }, {
        $limit: option.limit ?? NUMBER_ROW_PER_PAGE
      }, {
        $project: {
          ...projection,
          password: 0
        }
      }, {
        $lookup: {
          from: 'store',
          localField: 'store_id',
          foreignField: '_id',
          as: 'store'
        }
      }, {
        $lookup: {
          from: 'zip_code',
          localField: 'zip_code_id',
          foreignField: '_id',
          as: 'zip_code'
        }
      }, {
        $lookup: {
          from: 'municipality',
          localField: 'zip_code.municipality_id',
          foreignField: '_id',
          as: 'municipality'
        }
      }, {
        $lookup: {
          from: 'zip_code',
          localField: 'billing.zip_code_id',
          foreignField: '_id',
          as: 'billing.zip_code'
        }
      }, {
        $set: {
          municipality: {
            $arrayElemAt: ['$municipality', 0]
          },
          zip_code: {
            $arrayElemAt: ['$zip_code', 0]
          },
          store: {
            $arrayElemAt: ['$store', 0]
          },
          'billing.zip_code': {
            $arrayElemAt: ['$billing.zip_code', 0]
          },
        }
      }, {
        $addFields: {
          'municipality.overweight_price': {
            $toDouble: '$municipality.overweight_price',
          }
        }
      }, {
        $project:// collection: customer
        {
          _id: 1,
          name: 1,
          username: 1,
          password: 1,
          zip_code_id: 1,
          address: 1,
          email: 1,
          phone: 1,
          replacement_goods: 1,
          store_customer_number: 1,
          membership_number: 1,
          payment_method: 1,
          billing: 1,
          store_id: 1,
          cart: 1,
          store: {
            _id: 1,
            name: 1,
            zip_code_id: 1,
            zip_code_info: 1,
            payment: 1,
            municipality_list: 1,
          },
          municipality: 1,
          zip_code: 1,
          admin_comment: 1,
          pbs_customer_number: 1,
          credit_limit: 1,
          delivery_fee: 1,
          comment_list: 1,
          active: 1,
          type: 1,
          customer_list: 1,
          manage_by: 1,
          card: 1,
          fee_wallet_amount: 1,
          normal_wallet_amount: 1,
          most_bought_list: 1,
        }
      }
    ]).exec();
    return customerList;
  }

  async get(query) {
    if (!!query._id) {
      return {
        customer_list: await this.findByCondition({ _id: parseInt(query._id) }, { password: 0 }, { limit: 1 })
      }
    }
    let condition: any = {};

    if (query.name) {
      query.name = query.name.trim();

      if (/^\#(\d+)|^\@(.+)/.exec(query.name)) {
        try {
          const specialChar = query.name.substring(0, 1);
          switch (specialChar) {
            case '#':
              condition = {
                _id: parseInt(query.name.substring(1))
              };
              break;
            case '@':
              condition = {
                username: query.name.substring(1)
              };
              break;
            default:
              break;
          }
          return {
            customer_list: await this.findByCondition(condition, { password: 0 }, { limit: 1 })
          }
        } catch (e) {
          this.logError(e, 'customer', __filename);
          throw new BadRequestException();
        }
      }
    }


    let total = 0;
    let { limit = NUMBER_ROW_PER_PAGE, page = 1 } = query;
    limit = +limit; page = +page;

    let queryElastic: any = {
      index: ELASTIC_INDEX.customer,
      size: 1000,
      body: {
        query: {
          bool: {
            must: []
          }
        }
      }
    };
    //check search elastic
    for (const key in query) {
      if (query[key] == null) {
        continue;
      }
      switch (key) {
        case 'page':
        case 'limit':
          break;
        case 'type':
          queryElastic.body.query.bool.must.push({
            match: {
              type: {
                query: query[key],
                operator: 'and'
              }
            }
          });

          break;
        case 'pbs_customer_number_list':
          if (query.pbs_customer_number_list) {
            condition['pbs_customer_number'] = {
              $in: query.pbs_customer_number_list.split(',').map(x => parseInt(x))
            }
          }

          break;
        case 'store_id':
          condition[key] = parseInt(query[key]);
          break;
        case 'active':
          condition.active = (query[key] == 'true');
          break;
        case 'name':
          queryElastic.body.query.bool.must.push({
            match: {
              name: {
                query: query[key],
                operator: 'and'
              },
            }
          });

          break;
        default:
          throw new BadRequestException(`Not support column ${key}`);
      }
    }
    if (queryElastic.body.query.bool.must.length > 0) {
      console.log(JSON.stringify(queryElastic));
      const searchResult = (await this.elasticSearch.search(queryElastic)).body;
      let idList = [];
      if (searchResult.hits.total.value > 0) {
        total = searchResult.hits.total.value;
        searchResult.hits.hits.forEach(x => {
          idList.push(parseInt(x._id))
        })
      }
      condition._id = {
        '$in': idList
      };
    }

    let option = {
      sort: { _id: 1 },
      limit,
      skip: limit * (page - 1),
    };
    const customerList = await this.findByCondition(condition, { password: 0 }, option);
    if (page === 1) {
      if (total == 0) {
        total = await this.customersModel.countDocuments(condition).exec();
      }
      return {
        customer_list: customerList,
        total
      }
    }
    return {
      customer_list: customerList
    }
  }

  async findById(id: number): Promise<Customer> {
    let customer = (await this.findByCondition({ _id: id }, { password: 0 }, { limit: 1 }))[0] ?? null;
    if (customer) {
      return customer;
    }
    throw new NotFoundException('Not Found');
  }

  async getCart(_id: number): Promise<any> {
    let customer: any = await this.findById(_id);
    let cartItemList: any = Object.values(customer.cart?.product_list ?? {});
    let idList: number[] = cartItemList.map(e => parseInt(e._id));
    let products = idList.length ? (await this.productService.find({ id_list: idList.join(','), status: 'active' })).product_list : [];
    let cartsAndInfoProducts = [];
    for (const cart of cartItemList) {
      let item = products.find(e => cart._id === e._id);
      if (item) {
        let associatedList = null;
        if (item.associated_list?.length) {
          let idList = item.associated_list.filter(e => e.amount).map(e => e._id);
          if (idList.length) {
            associatedList = (await this.productService.find({
              id_list: idList.join(','),
              status: 'active',
            })).product_list;
            associatedList = associatedList.map(ele => {
              const associated_item = item.associated_list.find(e => e._id === ele._id);
              ele.amount = associated_item.amount;
              return ele;
            });
          }
        }

        if (isFreeNameProduct(cart._id)) {
          cart.list.forEach(e => {
            cartsAndInfoProducts.push({
              product: item,
              cart: {
                _id: cart._id,
                name: e.name,
                note: e.note,
                price: e.price,
                position: e.position,
                quantity: e.quantity,
              },
              associated_list: associatedList,
            });
          })
        } else {
          if (cart.weight_option_list) {
            cart.weight_option_list.forEach((weight_option, index) => {
              cartsAndInfoProducts.push({
                product: item,
                cart: {
                  _id: cart._id,
                  note: cart.note,
                  position: cart.position,
                  quantity: Array.isArray(cart.quantity) ? cart.quantity[index] : cart.quantity,
                  weight_option
                },
                associated_list: associatedList,
              });
            });
          } else {
            cartsAndInfoProducts.push({
              product: item,
              cart: cart,
              associated_list: associatedList,
            });
          }
        }
      }
    };

    return {
      product_list: cartsAndInfoProducts,
      note: customer.cart?.note,
    };
  }

  async updateCartMulti(_id: number, productList: any, note: string, orderId: number = null): Promise<any> {
    let updateObject: any = {
      '$set': {
        cart: {
          product_list: {},
          note,
        },
      }
    };
    if (orderId) {
      updateObject['$set']['cart']['order_id'] = orderId;
    }
    productList.forEach(item => {
      if (item.quantity && item._id && !item.associated_item_id) {
        if (isFreeNameProduct(item._id)) {
          if (!updateObject['$set'].cart.product_list[item._id]) {
            updateObject['$set'].cart.product_list[item._id] = {
              _id: item._id,
              list: [],
            };
          }
          updateObject['$set'].cart.product_list[item._id].list.push({
            name: item.name,
            position: item.position,
            note: item.note,
            quantity: item.quantity,
          });
        } else {
          if (!updateObject['$set'].cart.product_list[item._id]) {
            if (item.weight_option) {
              updateObject['$set'].cart.product_list[item._id] = {
                _id: item._id,
                position: item.position,
                note: item.note,
                quantity: [item.quantity],
                weight_option_list: [item.weight_option],
              };
            } else {
              updateObject['$set'].cart.product_list[item._id] = {
                _id: item._id,
                position: item.position,
                note: item.note,
                quantity: item.quantity,
              };
            }
          } else {
            if (updateObject['$set'].cart.product_list[item._id].weight_option_list) {
              updateObject['$set'].cart.product_list[item._id].weight_option_list.push(item.weight_option ?? null);
              updateObject['$set'].cart.product_list[item._id].quantity.push(item.quantity);
            } else {
              updateObject['$set'].cart.product_list[item._id].quantity += item.quantity;
            }
          }
        }
      }
    });

    const result = await this.updateById(_id, updateObject, this.customersModel);

    if (result.username) {
      updateFirebase(`/cart/${_id}`, [0, getNow()]);
    }
    return this.getCart(_id);
  }

  async cleanCart(_id: number) {
    const res = await this.updateById(_id, { cart: {} }, this.customersModel);

    if (res.username) {
      updateFirebase(`/cart/${_id}`, [0, getNow()]);
    }

    return {
      success: true
    }
  }

  async create(customer: CustomersDTO): Promise<Customer> {
    for (const key in customer) {
      if (customer[key] == null) {
        delete customer[key];
      }
    }
    const newItem = new this.customersModel({
      ...customer,
    });
    if (newItem.type == customerTypeMap.admin || newItem.type == customerTypeMap.normal && await this.validate(newItem)) {
      let result = await this.save(newItem, collection,
        (_id, model) => { // processFnPreSave
          model.pbs_customer_number = _id;
        }
      );
      if (result) {
        await this.indexElastic([{ ...result }]);
        return result;
      }
    } else {
      throw new BadRequestException(MSG_DUPLICATE_PHONE_ADDRESS_CUSTOMER);
    }
  }

  async update(_id, data): Promise<Customer> {
    if (!!_id) {
      if (!!data._id) {
        delete data._id;
      }
      let customer = await this.findById(_id);
      if (!!data.password) {
        data.password = await bcrypt.hash(data.password, 12)
      }
      if (!!data.phone || !!data.address || !!data.address || !!data.zip_code_id) {
        await this.validate({ ...data, _id });
      }
      if (!!data.name && customer.name != data.name) {
        if ((data.type ?? customer.type) == 2) {
          await this.customersModel.updateMany({ 'manage_by._id': _id }, {
            $set: {
              'manage_by.name': data.name
            }
          });
        } else {
          let manageBy = customer.manage_by ?? data.manage_by ?? null;
          if (manageBy && manageBy._id) {
            await this.customersModel.updateOne({ _id: manageBy._id }, {
              $set: {
                [`customer_list.${_id}.name`]: data.name
              }
            });
          }
        }
      }
      //check change manage by
      let oldManageByIdList = Object.keys(customer.manage_by ?? {}).filter(x => !Object.keys(data.manage_by ?? {}).includes(x));
      let newManageByIdList = Object.keys(data.manage_by ?? {}).filter(x => !Object.keys(customer.manage_by ?? {}).includes(x));

      if (oldManageByIdList.length > 0 || newManageByIdList.length > 0) {
        for (let i = 0; i < oldManageByIdList.length; i++) {
          let oldId = oldManageByIdList[i];
          await this.customersModel.updateOne({ _id: +oldId }, {
            $unset: {
              [`customer_list.${_id}`]: 1
            }
          });
        }
        for (let i = 0; i < newManageByIdList.length; i++) {
          let newId = newManageByIdList[i];
          await this.customersModel.updateOne({ _id: +newId }, {
            $set: {
              [`customer_list.${_id}`]: {
                _id: _id,
                name: data.name
              }
            }
          })
        }
      }

      //check change customer_list
      let oldCustomerIdList = Object.keys(customer.customer_list ?? {}).filter(x => !Object.keys(data.customer_list ?? {}).includes(x));
      let newCustomerIdList = Object.keys(data.customer_list ?? {}).filter(x => !Object.keys(customer.customer_list ?? {}).includes(x));

      if (oldCustomerIdList.length > 0 || newCustomerIdList.length > 0) {
        for (let i = 0; i < oldCustomerIdList.length; i++) {
          let oldId = oldCustomerIdList[i];
          await this.customersModel.updateOne({ _id: +oldId }, {
            $unset: {
              [`manage_by.${_id}`]: 1
            }
          });
        }
        for (let i = 0; i < newCustomerIdList.length; i++) {
          let newId = newCustomerIdList[i];
          await this.customersModel.updateOne({ _id: +newId }, {
            $set: {
              [`manage_by.${_id}`]: {
                _id: _id,
                name: data.name
              }
            }
          })
        }
      }

      const result = await this.updateById(_id, data, this.customersModel);
      //reindex elastic
      if (result) {
        await this.indexElastic([{ ...result }]);
        return { ...result, password: null };
      }
    } else {
      throw new BadRequestException();
    }
  }

  async delete(_id) {
    const result = this.remove(_id, this.customersModel, collection);
    if (result) {
      await this.deleteIndex(_id);
      return result;
    }
  }

  async validate(customer) {
    let condition = {
      _id: { $ne: customer._id },
      $or: [
        {
          phone: {
            $in: customer.phone
          }
        },
        {
          name: customer.name,
          address: customer.address,
          zip_code_id: customer.zip_code_id
        }
      ]
    }
    let check = await this.customersModel.findOne(condition, { projection: 0 }, { lean: true });
    if (check) {
      throw new BadRequestException(MSG_DUPLICATE_PHONE_ADDRESS_CUSTOMER);
    }
    return true;
  }

  async indexElastic(customerList: any[] = null, customerIdList: number[] = null) {
    if ((!customerList && !customerIdList) || (customerIdList && customerIdList.length === 0)) {
      return;
    }

    if (!customerList) {
      customerList = await this.findByCondition({ _id: { $in: customerIdList } });
    }
    let elasticDataSet = [];
    let dataList = [];
    let total = 0;
    customerList.forEach(customer => {
      total++;

      elasticDataSet.push({ index: { _index: ELASTIC_INDEX.customer, _id: customer._id } });

      let fullText = customer.name;
      if (customer.phone) {
        fullText += ' ' + customer.phone.join(' ')
      }
      if (customer.pbs_customer_number) {
        fullText += ' ' + customer.pbs_customer_number
      }
      if (customer.address) {
        fullText += ' ' + customer.address
      }

      let customerSet: any = {
        id: customer._id,
        name: fullText,
        type: customer.type,
      };

      dataList.push({
        _id: customer._id,
        ...customerSet
      });
      elasticDataSet.push(customerSet);
    });

    if (total === 1) {
      return await super.addIndex(dataList[0], collection);
    } else if (total > 1) {
      const res = await this.elasticSearch.bulk({ refresh: true, body: elasticDataSet });
      this.processElasticBulkResult(res, elasticDataSet);
    }
  }

  async deleteIndex(id) {
    super.deleteIndex(id, collection);
  }

  async getTransaction(customerId, type, query) {
    const NUMBER_TRANSACTION_PER_PAGE = 5;
    let total = 0;
    let { limit = NUMBER_TRANSACTION_PER_PAGE, page = 1 } = query;
    limit = +limit; page = +page;
    let condition = { customer_id: customerId, type };
    let option = {
      sort: { _id: -1 },
      limit,
      skip: limit * (page - 1),
    };
    const transactionList = await this.transactionModel.find(condition, { password: 0 }, option);
    if (page === 1) {
      return {
        total: await this.transactionModel.countDocuments(condition).exec(),
        transaction_list: transactionList,
      }
    }
    return {
      transaction_list: transactionList
    }
  }

  async updateWallet(_id, data): Promise<Customer> {
    const now = getNow();
    if (!!_id) {
      if (!!data._id) {
        delete data._id;
      }
      let customer: Customer = await this.findById(_id);
      if (customer) {
        let newValueNormalWallet = customer.normal_wallet_amount ?? 0;
        let newValueFeelWallet = customer.fee_wallet_amount ?? 0;

        for (let i = 0; i < data.new_transaction_list.length; i++) {
          let transaction = data.new_transaction_list[i];
          if (transaction.type == TRANSACTION_TYPE.normal) {
            newValueNormalWallet += transaction.amount;
          } else if (transaction.type == TRANSACTION_TYPE.fee) {
            newValueFeelWallet += transaction.amount;
          }

          let modelTracsaction = new this.transactionModel({
            ...transaction,
            customer_id: _id,
            date: now
          });
          await this.save(modelTracsaction, 'transaction');
        }
        return await this.updateById(_id, {
          normal_wallet_amount: newValueNormalWallet,
          fee_wallet_amount: newValueFeelWallet
        }, this.customersModel);
      } else {
        throw new NotFoundException('Not Found');
      }
    } else {
      throw new BadRequestException();
    }
  }
}
