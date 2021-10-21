import { getDb } from '../../../helper/db.helper';
import { OFFER_TYPE } from '../../../../share/constant'
import { DEFAULT_CONDITION_PRODUCT } from '../../../config/constant'
export async function getProductList(condition: any, storeId: any = null, offset: number = 0, limit: number = 10, sortCondition: any = null, isMembership: any = null, defaultCondition: boolean = true) {
  condition = {
    ...condition,
    ...(defaultCondition ? DEFAULT_CONDITION_PRODUCT : {}),
  };
  if (storeId) {
    condition.store_id_list = storeId;
  }
  let db = await getDb();
  let aggregateList: any = [];

  aggregateList = [
    {
      '$match': condition
    },
    {
      '$lookup': {
        from: 'offer',
        localField: '_id',
        foreignField: 'product_id_list',
        as: 'offer'
      }
    }, {
      $set: {
        offer: {
          $arrayElemAt: ['$offer', 0]
        },
      }
    }, {
      $match: {
        $or: [
          { 'offer': null },
          { 'offer.active': true }
        ]
      }
    }
  ];
  let countAggregateList = aggregateList.concat([
    { $count: "total" }
  ]);
  let countTotalRes = await db.collection('product').aggregate(countAggregateList).toArray();
  let countTotal = countTotalRes[0]?.total ?? 0;
  console.log('Total = ' + countTotal + ':\tdb.collection("product").aggregate(' + JSON.stringify(countAggregateList) + ')\n\n');

  if (typeof condition._id !== 'undefined') {
    // check sort category
    const conditionKeyList = Object.keys(condition);
    if (conditionKeyList.length === 2
      && conditionKeyList.includes('_id')
      && conditionKeyList.includes('status')
      && sortCondition && Object.keys(sortCondition).includes('order')) {
      aggregateList = aggregateList.concat([
        {
          '$lookup': {
            from: 'category',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          '$addFields': {
            'sortByCategoryOrder': { '$first': '$category.order' }
          }
        }
      ]);

      sortCondition = {
        sortByCategoryOrder: 1
      };
    } else {
      aggregateList = aggregateList.concat([
        {
          '$addFields': {
            'sortByIndexOfArray': {
              '$indexOfArray': [condition['_id']['$in'], '$_id']
            }
          }
        },
      ]);

      sortCondition = sortCondition ?? {
        sortByIndexOfArray: 1
      }
    }
  }

  let listOfferType = [OFFER_TYPE.PRICE, OFFER_TYPE.LIMIT, OFFER_TYPE.LIMIT_COMBO];
  if (isMembership) {
    listOfferType.push(OFFER_TYPE.MEMBER);
  }
  aggregateList = aggregateList.concat([
    {
      '$addFields': {
        'salePrice': {
          $cond: {
            if: { $in: ['$offer.type', listOfferType] },
            then: { $ifNull: ['$offer.sale_price', '$price'] },
            else: '$price'
          }
        }
      }
    },
  ]);
  if (storeId) {
    aggregateList = aggregateList.concat([
      {
        '$set': {
          'price': {
            $ifNull: [
              `$store_price_list[${storeId}]`
              , '$price']
          }
        }
      }
    ]);
  }

  if (sortCondition) {
    aggregateList.push(
      {
        '$sort': sortCondition
      }
    )
  }

  aggregateList = aggregateList.concat([
    {
      '$skip': offset
    },
    {
      '$limit': limit
    }
  ]);

  console.log('getProductList', 'db.collection("product").aggregate(' + JSON.stringify(aggregateList) + ')', "\n--------\n");

  let productList = (await db.collection('product')
    .aggregate(aggregateList)
    .toArray())
    .map((x: any) => {
      return {
        ...x,
        store_price_list: Object.keys(x.store_price_list).map(e => ({ store_id: +e, price: x.store_price_list[e] }))
      }
    });
  return { productList, countTotal };
}
export async function getProduct(condition: any, defaultCondition: boolean = true) {
  condition = {
    ...condition,
    ...(defaultCondition ? DEFAULT_CONDITION_PRODUCT : {}),
  }

  let db = await getDb();
  let productList = await db.collection('product')
    .aggregate([
      {
        '$match': condition
      },
      {
        '$limit': 1
      },
      {
        '$lookup': {
          from: 'offer',
          localField: '_id',
          foreignField: 'product_id_list',
          as: 'offer'
        }
      }, {
        $set: {
          offer: {
            $arrayElemAt: ['$offer', 0]
          },
        }
      },
    ])
    .toArray();

  if (productList[0]?.store_price_list) {
    productList[0].store_price_list = Object.keys(productList[0].store_price_list).map(e => ({ store_id: +e, price: productList[0].store_price_list[e] }));
  }

  return productList[0];
}
export async function updateTotalBought(totalBoughtList: any, customerId: number) {
  let db = await getDb();
  Object.keys(totalBoughtList).forEach(async (_id) => {
    const data = {
      $inc: {
        total_bought: totalBoughtList[_id],
        [`purchase_history.${customerId}`]: totalBoughtList[_id],
      }
    }
    await db.collection('product').updateOne({ _id: +_id }, data);
  });

  return {
    success: true
  };
}