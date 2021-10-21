import { ApolloError } from 'apollo-server-errors';
import config from '../config/config'
import { MSG_RETRY_INSERT, MAX_RETRY_INSERT } from '../config/constant';
const bcrypt = require('bcrypt');

const mongoClient = require('mongodb').MongoClient;
let client: any = undefined;

export async function getDb() {
  if (!!client && !!client.topology && client.topology.isConnected()) {
    return client.db(config.dbName);
  }
  let urlConnect = config.dbUri;
  client = await mongoClient.connect(urlConnect, {
    useUnifiedTopology: true,
  });
  return await client.db(config.dbName);
}

export async function closeDb() {
  try {
    client.close();
  } catch (e) {
    console.log(e);
  };
}

export const getCounter = async (collectionName: string) => {
  let db = await getDb();
  let result = await db.collection('counter').findOne({ _id: collectionName });
  return result ?? { _id: collectionName, max_id: 0, total: 0 };
}

export const increaseCounter = async (collectionName: string, inc: number = 1) => {
  let db = await getDb();
  await db.collection('counter').updateOne({ _id: collectionName }, {
    $inc: { max_id: inc, total: inc },
    $setOnInsert: { _id: collectionName },
  }, { upsert: true });
}

export const insertOne = async (data: any, collectionName: string) => {
  const db = await getDb();
  let retry = 0;

  if (collectionName === 'order') {
    let lastData = await db.collection('order').findOne({
      customer_id: data.customer_id,
    });
    if (lastData) {
      data.position = lastData.position + 1;
    } else {
      data.position = 1;
    }
  }

  while (retry < MAX_RETRY_INSERT) {
    let counter = await getCounter(collectionName);
    data._id = (counter?.max_id ?? 0) + 1;
    if (collectionName === 'order') {
      data.session = await bcrypt.hash(`${data.customer_id}_${data._id}_${config.secretCode}`, 12);
    }
    try {
      let result = (await db.collection(collectionName).insertOne(data)).ops[0];
      increaseCounter(collectionName);
      return result;
    } catch (err: any) {
      if (err.name === 'MongoError' && err.code === 11000) {
        retry++;
      } else {
        throw err;
      }
    }
  }
  throw new ApolloError(MSG_RETRY_INSERT, 'MSG_RETRY_INSERT');
}

export const insertMany = async (dataList: any[], collectionName: string) => {
  const db = await getDb();
  let retry = 0;

  while (retry < MAX_RETRY_INSERT) {
    let counter = await getCounter(collectionName);
    let maxID = (counter?.max_id ?? 0);
    dataList.forEach(item => {
      maxID++;
      item._id = maxID;
    });
    try {
      let result = await db.collection(collectionName).insertMany(dataList);
      increaseCounter(collectionName, dataList.length);
      return true;
    } catch (err: any) {
      if (err.name === 'MongoError' && err.code === 11000) {
        retry++;
      } else {
        throw err;
      }
    }
  }
  throw new ApolloError(MSG_RETRY_INSERT, 'MSG_RETRY_INSERT');
}