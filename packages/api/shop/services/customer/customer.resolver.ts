import { ArgsType, Field, Resolver, Query, Arg, Int, Mutation, Ctx, Float, Args } from 'type-graphql';

import Customer from './customer.type';
import loadCustomers from './customer.sample';
import { getDb } from '../../../helper/db.helper';
import { ApolloError } from 'apollo-server-errors';
import { FIELD_CANNOT_BE_UPDATED, PASSWORD_IS_WRONG, processUnsubcribleMailPattern, MSG_CAN_NOT_SEND_EMAIL, MAIL_ID } from '../../../config/constant';
import { convertUnixTime, getNow } from '../../../../share/time.helper';
import { sendMail } from '../../../utils/sendMail';
import ChildCustomer from './child_customer.type';
import { LoginType, LogoutType } from './auth.type';
import UpdateCartMultiArgs from './item_cart.type';
import { updateFirebase } from '../../helpers/firebase-helper';
import { checkCustomerContext } from '../../helpers/authenticate-helper';
import { createCard, Card, createCardGetLink } from '../../helpers/quickpay-helper';
import { getProduct, getProductList } from '../product/product.query';
import { CartResponse, ItemCartAndInfoProduct } from './cart.type';
import { AddPaymentCardLinkResponse } from './card.type';
import { isFreeNameProduct } from '../../../../share/general.helper';

const bcrypt = require('bcrypt');
const customerDefaultProjection = {
  _id: 1,
  username: 1,
  name: 1,
  type: 1
};
@Resolver()
export class CustomerResolver {
  private readonly items: Customer[] = loadCustomers();
  @Query(() => LoginType)
  async getCustomer(
    @Ctx() context: any
  ): Promise<any> {
    checkCustomerContext(context);

    return {
      customerInfo: context.customer,
      accessToken: context.accessToken ?? null,
    }
  }

  @Query(() => LoginType)
  async refreshToken(
    @Ctx() context: any
  ): Promise<any> {
    checkCustomerContext(context);

    return {
      customerInfo: context.customer,
      accessToken: context.accessToken ?? null,
    }
  }

  @Query(() => LogoutType)
  async logOut(
    @Ctx() context: any
  ): Promise<any> {
    checkCustomerContext(context);

    let db = await getDb();
    let unsetObject: any = {};
    unsetObject[`session.${context.req.cookies.refreshToken}`] = 1;
    await db.collection('customer').updateOne(
      {
        '_id': context.customer._id,
      },
      {
        '$unset': unsetObject
      }
    );
    context.res.clearCookie('refreshToken');

    return {
      success: true
    }
  }

  @Mutation(() => Customer, { description: 'Update Customer' })
  async updateMe(
    @Ctx() context: any,
    @Arg('meInput') meInput: string,
    @Arg('customer_id', (type) => Int, { nullable: true }) customer_id: number,
  ): Promise<Customer> {
    checkCustomerContext(context);

    let db = await getDb();
    const data = JSON.parse(meInput);
    Object.keys(data).forEach(field => {
      switch (field) {
        case 'email':
        case 'avatar':
        case 'membership_number':
        case 'replacement_goods':
        case 'payment_method': {
          break;
        }

        default: {
          throw new ApolloError(FIELD_CANNOT_BE_UPDATED.replace('{field}', field), 'FIELD_CANNOT_BE_UPDATED');
        }
      }
    })
    let projectData: any = {};
    Object.keys(data).forEach(v => projectData[v] = 1);

    let customerBefore = await db.collection('customer').findOne({
      '_id': context.customer.affectedCustomerId,
    });

    let updatedResult = await db.collection('customer').findOneAndUpdate(
      {
        '_id': context.customer.affectedCustomerId,
      },
      {
        '$set': {
          ...data,
          replacement_goods: {
            ...customerBefore.replacement_goods,
            ...(data.replacement_goods ?? {})
          }
        }
      },
      {
        projection: {
          ...customerDefaultProjection,
          ...projectData
        },
        returnOriginal: false
      }
    );
    await updateFirebase(`/customer/${context.customer.affectedCustomerId}`, [context.customer.sessionId, getNow()]);
    return updatedResult.value;
  }

  @Mutation(() => Customer, { description: 'Update Password' })
  async updatePassword(
    @Arg('oldPassword') oldPassword: string,
    @Arg('password') password: string,
    @Arg('customer_id', (type) => Int, { nullable: true }) customer_id: number,
    @Ctx() context: any,
  ): Promise<Customer> {
    checkCustomerContext(context);

    let db = await getDb();
    let customer = await db.collection('customer').findOne({
      '_id': context.customer.affectedCustomerId,
    });
    let updatedResult = null;
    if (customer) {
      const match = await bcrypt.compare(oldPassword, customer.password);
      if (match) {
        updatedResult = await db.collection('customer').findOneAndUpdate(
          {
            '_id': context.customer.affectedCustomerId,
          },
          {
            '$set': {
              password: await bcrypt.hash(password, 12),
            }
          },
          {
            projection: customerDefaultProjection,
            returnOriginal: false
          }
        );
        if (!updatedResult.value) {
          throw new ApolloError(PASSWORD_IS_WRONG, 'UPDATE_PASSWORD_FAILED');
        }
      } else {
        throw new ApolloError(PASSWORD_IS_WRONG, 'UPDATE_PASSWORD_FAILED');
      }
    }

    await updateFirebase(`/customer/${context.customer.affectedCustomerId}`, [context.customer.sessionId, getNow()]);
    return updatedResult.value;
  }

  @Mutation(() => AddPaymentCardLinkResponse, { description: 'Add Payment Card' })
  async getAddPaymentCardLink(
    @Ctx() context: any,
  ): Promise<AddPaymentCardLinkResponse> {
    let db = await getDb();
    let customer = await db.collection('customer').findOne({ _id: context.customer._id }, { projection: { card: 1 }, lean: true });
    if (customer.card && customer.card.length > 0) {
      throw new ApolloError('Already have card', 'ADD_CARD_FAILED');
    }

    //check card saved in db not validate
    let store = await db.collection('store').findOne({ _id: context.customer.store_id });
    if (!store.quickpay_info.api_key) {
      throw new ApolloError('Your store do not support this payment. Please contact administrator', '@PUBLIC_STORE_DO_NOT_HAVE_PAYMENT_CONFIG');
    }
    let addCardUrl: string = await createCardGetLink(store.quickpay_info.api_key, store._id, customer._id);
    return {
      url: addCardUrl
    }
  }

  @Mutation(() => Customer, { description: 'Delete Payment Card' })
  async updatePrimaryPaymentCard(
    @Arg('cardId', (type) => Int) cardId: number,
    @Ctx() context: any,
  ): Promise<Customer> {
    let db = await getDb();
    let customer = await db.collection('customer').findOne({ _id: context.customer._id }, { projection: { name: 1, card: 1 }, lean: true });
    if (!customer.card.map((x: any) => x._id).includes(cardId)) {
      throw new ApolloError('Card not found', 'UPDATE_PRIMARY_CARD_FAILED');
    }
    customer = await db.collection('customer').findOneAndUpdate({ _id: context.customer._id }, {
      '$set': {
        card: customer.card.map((card: any) => {
          if (card._id == cardId) {
            return { ...card, type: 'primary' };
          }
          return { ...card, type: 'primary' };
        })
      }
    }, { returnOriginal: false });
    customer = customer.value;
    await db.collection('card').findOneAndUpdate({ '_id': cardId }, { '$set': { 'type': 'primary' } }, { returnOriginal: false });
    await db.collection('card').updateMany({ '_id': { $in: customer.card.filter((x: any) => x._id != cardId) } }, { '$set': { 'type': 'secondary' } }, { returnOriginal: false });
    return {
      ...customer,
    };
  }
  @Mutation(() => Customer, { description: 'Delete Payment Card' })
  async deletePaymentCard(
    @Arg('cardId', (type) => Int) cardId: number,
    @Ctx() context: any,
  ): Promise<Customer> {
    let db = await getDb();
    let customer = await db.collection('customer').findOne({ _id: context.customer._id }, { projection: { name: 1, card: 1 } });
    if (!customer.card.map((x: any) => x._id).includes(cardId)) {
      throw new ApolloError('Card not found', 'DELETE_PAYMENT_CARD_FAILED');
    }
    await db.collection('card').deleteOne({ '_id': cardId });
    let newCardList = customer.card.filter((x: any) => x._id != cardId);
    let result = await db.collection('customer').findOneAndUpdate({ '_id': context.customer._id, }, { '$set': { 'card': newCardList } }, { projection: customerDefaultProjection, returnOriginal: false });

    return result.value;
  }

  @Mutation(() => Customer, { description: 'Add Favorite Product' })
  async addFavoriteProduct(
    @Ctx() context: any,
    @Arg('product_id', (type) => Int) product_id: number,
    @Arg('customer_id', (type) => Int, { nullable: true }) customer_id?: number,
  ): Promise<Customer> {
    checkCustomerContext(context);

    let db = await getDb();
    let customer = await db.collection('customer').findOne({ _id: context.customer.affectedCustomerId }, { projection: { favorite_list: 1 } });

    let favoriteList = customer.favorite_list ?? [];
    favoriteList.push(product_id);
    favoriteList = [...new Set(favoriteList)];

    let updatedResult = await db.collection('customer').findOneAndUpdate(
      { '_id': context.customer.affectedCustomerId },
      {
        '$set': {
          favorite_list: favoriteList
        }
      },
      {
        projection: {
          ...customerDefaultProjection,
          favorite_list: 1
        },
        returnNewDocument: true
      }
    );
    await updateFirebase(`/customer/${context.customer.affectedCustomerId}`, [context.customer.sessionId, getNow()]);
    return updatedResult.value;
  }

  @Mutation(() => Customer, { description: 'Add Favorite Product' })
  async removeFavoriteProduct(
    @Ctx() context: any,
    @Arg('product_id', (type) => Int) product_id: number,
    @Arg('customer_id', (type) => Int, { nullable: true }) customer_id?: number,
  ): Promise<Customer> {
    checkCustomerContext(context);

    let db = await getDb();
    let customer = await db.collection('customer').findOne({ _id: context.customer.affectedCustomerId }, { projection: { favorite_list: 1 } });

    let favoriteList = customer.favorite_list;
    favoriteList = favoriteList.filter((x: number) => {
      return x != product_id
    });
    let updatedResult = await db.collection('customer').findOneAndUpdate(
      { '_id': context.customer.affectedCustomerId },
      {
        '$set': {
          favorite_list: favoriteList
        }
      },
      {
        projection: {
          ...customerDefaultProjection,
          favorite_list: 1
        },
        returnNewDocument: true
      }
    );
    await updateFirebase(`/customer/${context.customer.affectedCustomerId}`, [context.customer.sessionId, getNow()]);
    return updatedResult.value;
  }

  @Query(() => LoginType, { description: 'Get Customer detail(child customer)' })
  async getChildCustomer(
    @Arg('customer_id', (type) => Int) customer_id: number,
    @Ctx() context: any
  ): Promise<LoginType> {
    checkCustomerContext(context, customer_id);

    let db = await getDb();
    let customer = await db.collection('customer').aggregate([
      { '$match': { _id: customer_id } },
      {
        '$project': {
          password: 0,
          cart: 0
        }
      },
      {
        '$lookup': {
          from: 'store',
          localField: 'store_id',
          foreignField: '_id',
          as: 'store'
        }
      },
      {
        '$lookup': {
          from: 'zip_code',
          localField: 'zip_code_id',
          foreignField: '_id',
          as: 'zip_code'
        }
      },
      {
        '$lookup': {
          from: 'municipality',
          localField: 'zip_code.municipality_id',
          foreignField: '_id',
          as: 'municipality'
        }
      },
      {
        '$set': {
          municipality: {
            $arrayElemAt: ['$municipality', 0]
          },
          store: {
            $arrayElemAt: ['$store', 0]
          },
          zip_code: {
            $arrayElemAt: ['$zip_code', 0]
          },
        }
      },
      {
        $addFields: {
          'municipality.overweight_price': {
            $toDouble: '$municipality.overweight_price',
          }
        }
      },
      {
        '$lookup': {
          from: 'zip_code',
          localField: 'store.zip_code_id',
          foreignField: '_id',
          as: 'store_zip_code'
        }
      },
      {
        '$set': {
          store_zip_code: {
            '$first': '$store_zip_code'
          },
        }
      },
    ]).toArray();
    customer = customer[0];
    return {
      customerInfo: {
        ...customer,
        customer_list: null
      },
      accessToken: context.accessToken,
    }
  }

  @Mutation(() => ChildCustomer, { description: 'Unsubcribe for customer' })
  async unsubcribe(
    @Arg('customer_id', (type) => Int) customer_id: number,
    @Ctx() context: any
  ): Promise<ChildCustomer> {
    checkCustomerContext(context, customer_id);

    let db = await getDb();

    let nowUnixTime = getNow();
    let res = await sendMail({ customer_id, home_helper_id: context.customer._id, mail_id: MAIL_ID.unsubcribe });
    if (res) {
      let setObject: any = {};
      setObject['customer_list.' + customer_id + '.unsubcribe'] = nowUnixTime;
      let updatedResult = await db.collection('customer').findOneAndUpdate(
        {
          '_id': context.customer._id,
        },
        {
          '$set': setObject
        },
        {
          projection: {
            ...customerDefaultProjection,
            customer_list: 1
          },
          returnOriginal: false
        }
      );

      return updatedResult.value.customer_list[customer_id];
    } else {
      throw new ApolloError(MSG_CAN_NOT_SEND_EMAIL, '@PUBLIC_CAN_NOT_SEND_EMAIL');
    }
  }

  @Mutation(() => [ItemCartAndInfoProduct], { description: 'Update cart customer' })
  async updateCart(
    @Arg('_id', () => Int!) _id: number,
    @Arg('name', () => String, { nullable: true }) name: string,
    @Arg('quantity', () => Int, { nullable: true }) quantity: number,
    @Arg('quantity_list', () => [Int], { nullable: true }) quantity_list: number[],
    @Arg('note', () => String, { nullable: true }) note: string,
    @Arg('position', () => Int, { nullable: true, defaultValue: 1 }) position: number,
    @Arg('price', () => Float, { nullable: true }) price: number,
    @Arg('weight_option_list', () => [Int], { nullable: 'itemsAndList' }) weight_option_list: number[],
    @Ctx() context: any
  ): Promise<ItemCartAndInfoProduct[]> {
    checkCustomerContext(context);

    let db = await getDb();

    let updateObject: any = {};

    if (isFreeNameProduct(_id)) {
      let customer: any = await db.collection('customer').findOne(
        {
          '_id': context.customer.affectedCustomerId,
        },
        {
          projection: {
            ...customerDefaultProjection,
            cart: 1
          },
          returnOriginal: false
        }
      );
      let product: any = customer.cart.product_list?.[_id];
      if (product) {
        if (quantity > 0) {
          product.list = product.list.map((e: any) => {
            if (e.position === position) {
              return { name, position, note, quantity, price }
            }
            return e;
          });
        } else {
          product.list = product.list.filter((e: any) => {
            return e.position != position
          });
        }
      } else {
        product = {
          _id: _id,
          list: [
            { name, position, note, quantity, price }
          ]
        }
      }
      if (product.list.length > 0) {
        updateObject = {
          '$set': {
            [`cart.product_list.${_id}`]: product
          }
        };
      } else {
        updateObject = {
          '$unset': {
            [`cart.product_list.${_id}`]: 1
          }
        }
      }
    } else {
      if (weight_option_list) {
        updateObject = {
          '$set': {
            [`cart.product_list.${_id}`]: { _id, quantity: quantity_list, note, position, weight_option_list }
          }
        }
      } else {
        if (quantity > 0) {
          updateObject = {
            '$set': {
              [`cart.product_list.${_id}`]: { _id, quantity, note, position, }
            }
          }
        } else {
          updateObject = {
            '$unset': {
              [`cart.product_list.${_id}`]: 1
            }
          }
        }
      }
    }
    //unset order id
    updateObject = {
      ...updateObject,
      '$unset': {
        ...updateObject['$unset'],
        'cart.order_id': 1
      }
    }
    let updatedResult = await db.collection('customer').findOneAndUpdate(
      {
        '_id': context.customer.affectedCustomerId,
      },
      updateObject,
      {
        projection: {
          ...customerDefaultProjection,
          cart: 1
        },
        returnOriginal: false
      }
    );

    await updateFirebase(`/cart/${context.customer.affectedCustomerId}`, [context.customer.sessionId, getNow()]);

    const cartsAndInfoProducts: ItemCartAndInfoProduct[] = [];
    const product = await getProduct({ _id }, false);
    let associatedList: any = null;
    if (product && product.associated_list?.length) {
      const idList = product.associated_list.filter((e: any) => e.amount).map((e: any) => e._id);
      const associatedProductList = await getProductList({ _id: { '$in': idList } }, null, 0, idList.length, undefined, undefined, false);
      associatedList = associatedProductList.productList.map((ele: any) => {
        const associated_item = product.associated_list.find((e: any) => e._id === ele._id);
        ele.amount = associated_item.amount;
        return ele;
      });
    }
    if (weight_option_list) {
      weight_option_list.forEach((weight_option: number, index: number) => {
        cartsAndInfoProducts.push({
          product,
          cart: { _id, name, note, quantity: quantity_list[index], position, weight_option },
          associated_list: associatedList,
        });
      });
    } else {
      cartsAndInfoProducts.push({
        product,
        cart: { _id, name, note, quantity, position, },
        associated_list: associatedList,
      });
    }
    return cartsAndInfoProducts;
  }

  @Mutation(() => CartResponse, { description: 'Update cart note' })
  async updateCartNote(
    @Arg('note', () => String, { nullable: true }) note: string,
    @Ctx() context: any,
  ): Promise<CartResponse> {
    checkCustomerContext(context);

    let db = await getDb();

    let updateObject: any = {
      '$set': {
        'cart.note': note,
      },
    };

    let updatedResult = await db.collection('customer').findOneAndUpdate(
      {
        '_id': context.customer.affectedCustomerId,
      },
      updateObject,
      {
        projection: {
          ...customerDefaultProjection,
          cart: 1
        },
        returnOriginal: false
      }
    );

    await updateFirebase(`/cart/${context.customer.affectedCustomerId}`, [context.customer.sessionId, getNow()]);

    return {
      note: note,
    }
  }

  @Mutation(() => CartResponse, { description: 'Update cart customer' })
  async updateCartMulti(
    @Args() { product_list }: UpdateCartMultiArgs,
    @Ctx() context: any
  ): Promise<CartResponse> {
    checkCustomerContext(context);

    let db = await getDb();

    let updateObject: any = {
      '$set': {
        'cart.product_list': {},
      }
    };

    product_list.forEach((item: any) => {
      if (item.quantity) {
        if (isFreeNameProduct(item._id)) {
          if (!updateObject['$set']['cart.product_list'][item._id]) {
            updateObject['$set']['cart.product_list'][item._id] = {
              _id: item._id,
              list: [],
            };
          }

          updateObject['$set']['cart.product_list'][item._id].list.push({
            name: item.name,
            position: item.position,
            note: item.note,
            quantity: item.quantity,
          });
        } else {
          if (!updateObject['$set']['cart.product_list'][item._id]) {
            if (item.weight_option) {
              updateObject['$set']['cart.product_list'][item._id] = {
                _id: item._id,
                position: item.position,
                note: item.note,
                quantity: [item.quantity],
                weight_option_list: [item.weight_option],
              };
            } else {
              updateObject['$set']['cart.product_list'][item._id] = {
                _id: item._id,
                position: item.position,
                note: item.note,
                quantity: item.quantity,
              };
            }
          } else {
            if (updateObject['$set']['cart.product_list'][item._id].weight_option_list) {
              updateObject['$set']['cart.product_list'][item._id].weight_option_list.push(item.weight_option ?? null);
              updateObject['$set']['cart.product_list'][item._id].quantity.push(item.quantity);
            } else {
              if (item.weight_option) {
                updateObject['$set']['cart.product_list'][item._id].weight_option_list = [null, item.weight_option ?? null];
                updateObject['$set']['cart.product_list'][item._id].quantity = [updateObject['$set']['cart.product_list'][item._id].quantity, item.quantity];
              }
            }
          }
        }
      }
    });

    let updatedResult = await db.collection('customer').findOneAndUpdate(
      {
        '_id': context.customer.affectedCustomerId,
      },
      updateObject,
      {
        projection: {
          ...customerDefaultProjection,
          cart: 1
        },
        returnOriginal: false
      }
    );

    await updateFirebase(`/cart/${context.customer.affectedCustomerId}`, [context.customer.sessionId, getNow()]);
    return this.getCart(context);
  }

  @Query(() => CartResponse, { description: 'Get cart customer' })
  async getCart(
    @Ctx() context: any
  ): Promise<CartResponse> {
    checkCustomerContext(context);

    let db = await getDb();
    let customer = await db.collection('customer').findOne(
      {
        '_id': context.customer.affectedCustomerId,
      },
      {
        projection: {
          ...customerDefaultProjection,
          cart: 1
        },
        returnOriginal: false
      }
    );

    const cartItemList: any[] = Object.values(customer.cart?.product_list ?? {});
    let idList: number[] = cartItemList.map((e: any) => parseInt(e._id));
    if (idList.length === 0) {
      return {
        product_list: [],
        note: customer.cart?.note,
      };
    }
    let { productList } = await getProductList({ '_id': { '$in': idList } }, null, 0, idList.length, undefined, undefined, false);

    const cartsAndInfoProducts: ItemCartAndInfoProduct[] = [];
    for (const cart of cartItemList) {
      let item = productList.find((e: any) => cart._id === e._id);
      if (item) {
        let associatedList: any = null;
        if (item.associated_list?.length) {
          idList = item.associated_list.filter((e: any) => e.amount).map((e: any) => e._id);
          const { productList } = await getProductList({ _id: { '$in': idList } }, null, 0, idList.length, undefined, undefined, false);
          associatedList = productList.map((ele: any) => {
            const associated_item = item.associated_list.find((e: any) => e._id === ele._id);
            ele.amount = associated_item.amount;
            return ele;
          });
        }

        if (isFreeNameProduct(cart._id)) {
          cart.list.forEach((e: any) => {
            cartsAndInfoProducts.push({
              product: item,
              cart: {
                _id: cart._id,
                price: e.price ?? item.price,
                name: e.name,
                note: e.note,
                position: e.position,
                quantity: e.quantity,
              },
              associated_list: associatedList,
            });
          })
        } else {
          if (cart.weight_option_list) {
            cart.weight_option_list.forEach((weight_option: number, index: number) => {
              cartsAndInfoProducts.push({
                product: item,
                cart: {
                  _id: cart._id,
                  note: cart.note,
                  position: cart.position,
                  quantity: Array.isArray(cart.quantity) ? cart.quantity[index] : cart.quantity,
                  weight_option,
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
    }

    return {
      product_list: cartsAndInfoProducts,
      note: customer.cart?.note,
      order_id: customer.cart?.order_id,
    }
  }

  @Query(() => Customer, { description: 'Get customer list' })
  async getCustomerList(
    @Ctx() context: any
  ): Promise<Customer> {
    checkCustomerContext(context);

    let db = await getDb();
    let customer = await db.collection('customer').findOne({
      _id: context.customer._id
    }, {
      projection: {
        ...customerDefaultProjection,
        customer_list: 1
      }
    });
    customer.customer_list = Object.values(customer.customer_list);

    return customer;
  }

  @Query(() => Customer)
  async getFavoriteMostBoughtList(
    @Ctx() context: any,
    @Arg('customer_id', (type) => Int, { nullable: true }) customer_id: number,
  ): Promise<any> {
    checkCustomerContext(context);

    let db = await getDb();
    let customer = await db.collection('customer').findOne({
      _id: context.customer.affectedCustomerId
    }, {
      projection: {
        favorite_list: 1,
        most_bought_list: 1
      }
    });

    return {
      favorite_list: customer.favorite_list,
      most_bought_list: customer.most_bought_list
    };
  }
}
