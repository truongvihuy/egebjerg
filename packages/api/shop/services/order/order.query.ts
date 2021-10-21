import { getDb, insertOne } from '../../../helper/db.helper';

export async function getOrderList(condition: any, offset: number = 0, limit: number = 5) {
  let db = await getDb();
  let orderList = await db.collection('order')
    .aggregate([
      {
        '$match': condition
      },
      {
        '$sort': { _id: -1 },
      },
      {
        '$skip': offset
      },
      {
        '$limit': limit
      }
    ])
    .toArray();
  let lastOrder = await db.collection('order').findOne({
    customer_id: condition['customer_id']
  });
  return { orderList, countTotal: lastOrder?.position ?? 0 };
}

export async function getOrder(condition: any) {
  let db = await getDb();

  let order = await db.collection('order').findOne(condition);
  return order;
}

export async function addOrder(order: any) {
  let orderResult = await insertOne(order, 'order');

  return orderResult;
}

export async function updateOrder(_id: number, data: any) {
  let db = await getDb();
  await db.collection('order').findOneAndUpdate({ _id: _id }, {
    $set: data,
  }, { returnOriginal: false });
}