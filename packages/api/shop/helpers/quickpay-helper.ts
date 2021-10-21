import axios from 'axios';
import config from '../../config/config';
import { getDb, insertOne } from '../../helper/db.helper';
import crypto from 'crypto';
import { ApolloError } from 'apollo-server-errors';
import { ORDER_STATUS } from '../../../share/constant';
import { resetCart } from './cart-helper';
const FormData = require('form-data');
const QUICK_PAY_API = 'https://api.quickpay.net';
const getAuthToken = (apiKey: string) => 'Basic ' + Buffer.from(':' + apiKey).toString('base64');
const paymentMethodList = 'dankort, visa, 3d-visa, 3d-dankort';
export type Card = {
  number: string,
  name: string,
  expire: {
    month: string,
    year: string,
  },
  CVV: string
};
export const createCard = async (apiKey: string, cardInfo: Card, cardId = null, storeId = null) => {
  if (!apiKey) {
    return null;
  }
  const db = await getDb();
  const authToken = getAuthToken(apiKey);
  if (cardId == null) {
    let { data } = await axios.post(`${QUICK_PAY_API}/cards`, {}, {
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10'
      }
    });
    cardId = data.id;
    await db.collection('card').insertOne({
      _id: cardId,
      store_id: storeId,
      validate: false
    })
  }
  //authen card
  try {
    var dataPost = new FormData();
    dataPost.append('card[number]', cardInfo.number.split(' ').join(''));
    dataPost.append('card[expiration]', `${cardInfo.expire.year}${cardInfo.expire.month}`);
    dataPost.append('card[cvd]', cardInfo.CVV);
    dataPost.append('card[issued_to]', cardInfo.name);
    dataPost.append('acquirer', 'clearhaus');
    const response = await axios.post(`${QUICK_PAY_API}/cards/${cardId}/authorize`, dataPost, {
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10',
        ...dataPost.getHeaders(),
        data: dataPost
      }
    });
    return response.data;
  } catch (e) {
    return e.response.data;
  }
}
export const createCardGetLink = async (apiKey: string, storeId = null, customerId = null, orderId: any = null) => {
  if (!apiKey) {
    return null;
  }
  const db = await getDb();
  const authToken = getAuthToken(apiKey);

  let cardSaved = await db.collection('card').findOne({ validate: false, store_id: storeId }, { lean: true });
  let cardId = cardSaved?._id ?? null;
  if (cardId == null) {
    let dataPost = new FormData();
    dataPost.append('variables[customer_id]', customerId);
    dataPost.append('variables[store_id]', storeId);
    let { data } = await axios.post(`${QUICK_PAY_API}/cards`, dataPost, {
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10',
        ...dataPost.getHeaders(),
        data: dataPost
      }
    });
    cardId = data.id;
    await db.collection('card').insertOne({
      _id: cardId,
      store_id: storeId,
      validate: false
    })
  } else {
    let dataPost = new FormData();
    dataPost.append('variables[customer_id]', customerId);
    dataPost.append('variables[store_id]', storeId);
    await axios.patch(`${QUICK_PAY_API}/cards/${cardId}`, dataPost, {
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10',
        ...dataPost.getHeaders(),
        data: dataPost
      }
    });
  }
  //get card link
  try {
    let dataPost = new FormData();
    if (orderId) {
      dataPost.append('payment_methods', paymentMethodList);
      dataPost.append('continueurl', `${config.PUBLIC_SHOP_URL}/order-received?id=${orderId}&confirm=1`);
      dataPost.append('cancelurl', `${config.PUBLIC_SHOP_URL}/checkout?cancel_payment=1`);
      dataPost.append('variables[order_id]', orderId);
    } else {
      dataPost.append('payment_methods', paymentMethodList);
      dataPost.append('continueurl', `${config.PUBLIC_SHOP_URL}/profile`);
      dataPost.append('cancelurl', `${config.PUBLIC_SHOP_URL}/profile`);
    }
    let { data } = await axios.put(`${QUICK_PAY_API}/cards/${cardId}/link`, dataPost, {
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10',
        ...dataPost.getHeaders(),
      }
    });
    return data.url;
  } catch (e:any) {
    return e?.response?.data;
  }
}


//create payment
const createPayment = async (authToken: string, orderId: number) => {
  try {
    //get payment by order id 
    let paymentList = (await axios.get(`${QUICK_PAY_API}/payments`, {
      params: {
        order_id: orderId,
      },
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10',
      }
    })).data;
    if (paymentList.length == 1) {
      return paymentList[0];
    }
    //create payment
    let dataPost = new FormData();
    dataPost.append('currency', 'dkk');
    dataPost.append('order_id', orderId.toString());
    dataPost.append('payment_methods', paymentMethodList);
    let payment = (await axios.post(`${QUICK_PAY_API}/payments`, dataPost, {
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10',
        ...dataPost.getHeaders(),
      }
    })).data;
    return payment;
  } catch (e) {
    console.log(e);
  }
}
export const processPayment = async (apiKey: string, orderId: number, amount: number, customer: any = null, paymentId: any = null, cardId: any = null, storeId: any = null) => {
  if (!apiKey) {
    return null;
  }
  //quickpay use amount øre
  amount = amount * 100;

  const authToken = getAuthToken(apiKey);
  //already have payment id, generate new payment link
  if (paymentId) {
    let dataPost = new FormData();
    dataPost.append('amount', amount);
    dataPost.append('continue_url', `${config.PUBLIC_SHOP_URL}/order-received?id=${orderId}&confirm=1`);
    dataPost.append('cancel_url', `${config.PUBLIC_SHOP_URL}/checkout?cancel_payment=1`);
    let paymentUrl = (await axios.put(`${QUICK_PAY_API}/payments/${paymentId}/link`, dataPost, {
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10',
        ...dataPost.getHeaders(),
      }
    })).data;
    return {
      payment_id: paymentId,
      payment_url: paymentUrl.url
    }
  }
  //payment with saved card
  if (cardId) {
    let payment = await createPayment(authToken, orderId);
    let tokenCard = (await axios.post(`${QUICK_PAY_API}/cards/${cardId}/tokens`, {}, {
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10',
      }
    })).data;
    //Authorize payment using the token
    let dataPost = new FormData();
    dataPost.append('card[token]', tokenCard.token);
    dataPost.append('amount', amount);
    let resultPayment = (await axios.post(`${QUICK_PAY_API}/payments/${payment.id}/authorize`, dataPost, {
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10',
        ...dataPost.getHeaders(),
      }
    })).data;
    if (resultPayment.accepted == false && resultPayment.state == 'rejected') {
      throw new ApolloError('Payment rejected, please change card or use another payment method', '@PUBLIC_PAYMENT_REJECTED');
    }
    return payment.id;
  }


  if (customer) {
    //create token for auth payment 
    let primaryCard = customer.card?.find((x: any) => x.type == 'primary');
    if (primaryCard) {
      let payment = await createPayment(authToken, orderId);
      let tokenCard = (await axios.post(`${QUICK_PAY_API}/cards/${primaryCard._id}/tokens`, {}, {
        headers: {
          Authorization: authToken,
          'Accept-Version': 'v10',
        }
      })).data;
      //Authorize payment using the token
      let dataPost = new FormData();
      dataPost.append('card[token]', tokenCard.token);
      dataPost.append('amount', amount);
      let resultPayment = (await axios.post(`${QUICK_PAY_API}/payments/${payment.id}/authorize`, dataPost, {
        headers: {
          Authorization: authToken,
          'Accept-Version': 'v10',
          ...dataPost.getHeaders(),
        }
      })).data;
      if (resultPayment.accepted == false && resultPayment.state == 'rejected') {
        throw new ApolloError('Payment rejected, please change card or use another payment method', '@PUBLIC_PAYMENT_REJECTED');
      }
      return payment.id;
    } else {
      return {
        payment_id: paymentId,
        payment_url: await createCardGetLink(apiKey, storeId, customer._id, orderId),
      }
    }
  } else {
    let payment = await createPayment(authToken, orderId);
    let dataPost = new FormData();
    dataPost.append('amount', amount);
    dataPost.append('continue_url', `${config.PUBLIC_SHOP_URL}/order-received?id=${orderId}&confirm=1`);
    dataPost.append('cancel_url', `${config.PUBLIC_SHOP_URL}/checkout?cancel_payment=1`);
    let paymentUrl = (await axios.put(`${QUICK_PAY_API}/payments/${payment.id}/link`, dataPost, {
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10',
        ...dataPost.getHeaders(),
      }
    })).data;
    return {
      payment_id: paymentId,
      payment_url: paymentUrl.url
    }
  }

}

export const handleCallBack = async (req: any, res: any) => {
  const db = await getDb();
  const checksum = req.headers['quickpay-checksum-sha256'] ?? req.headers['QuickPay-Checksum-Sha256'];
  const merchantId = req.headers['quickpay-account-id'] ?? req.headers['QuickPay-Account-Id'];

  let store = await db.collection('store').findOne({ 'quickpay_info.merchant': merchantId }, { 'quickpay_info': 1 });
  if (store) {
    const apiKey = store.quickpay_info.secret;
    const body = req.body;
    const bodyAsString = JSON.stringify(body);
    const bodyHashed = crypto
      .createHmac('sha256', apiKey)
      .update(bodyAsString)
      .digest('hex');
    if (checksum === bodyHashed) {
      // Request is authenticated
      switch (body.type) {
        case 'Payment': {
          let payment = body;
          let lastOperation = payment.operations[payment.operations.length - 1] ?? null;
          if (lastOperation && lastOperation.type == 'authorize' && lastOperation.qp_status_msg == 'Approved' && lastOperation.aq_status_msg == 'Approved') {
            let orderQuickpay = await db.collection('order_quickpay').findOne({ _id: +payment.order_id });
            let order = await db.collection('order').findOneAndUpdate({ _id: orderQuickpay.order_id }, {
              $set: {
                status: ORDER_STATUS.received,
                status_note: null,
              }
            }, {
              projection: {
                customer_id: 1
              },
              returnOriginal: false,
            });
            if (order.value) {
              order = order.value;
              await resetCart(order.customer_id);
            }
          }
          break;
        }
        case 'Card': {
          let card = body;
          let lastOperation = card.operations[card.operations.length - 1];
          if (lastOperation.type == 'authorize' && lastOperation.qp_status_msg == 'Approved' && lastOperation.aq_status_msg == 'Approved') {
            let updateCardData: any = {
              type: 'primary',
              name: body.metadata.issued_to,
              cardType: body.metadata.brand,
              bin: body.metadata.bin,
              lastFourDigit: body.metadata.last4,
              validate: true
            }
            await db.collection('card').updateOne({ _id: card.id }, { $set: updateCardData });
            await db.collection('customer').updateOne({ _id: +card.variables.customer_id }, {
              $push: {
                card: {
                  _id: card.id,
                  ...updateCardData,
                }
              }
            });
            if (card.link.continueurl) {
              let orderId = (card.link.continueurl).match(/id=(\d+)/);
              if (orderId) {
                orderId = + orderId[1];
                let order = await db.collection('order').findOne({ _id: orderId });
                let orderQuickpay = await createOrderQuickpay(order._id);
                if (order) {
                  let store = await db.collection('store').findOne({ _id: order.store._id });
                  try {
                    let paymentId = await processPayment(store.quickpay_info.api_key, orderQuickpay._id, order.amount, null, null, card.id);
                    await db.collection('order_quickpay').updateOne({ _id: orderQuickpay._id }, { $set: { payment_id: paymentId } });
                    await db.collection('order').updateOne({ _id: order._id }, {
                      $set: {
                        status: ORDER_STATUS.received,
                        status_note: null,
                        order_quickpay_id: orderQuickpay._id,
                      }
                    });
                    await resetCart(+card.variables.customer_id);
                  } catch (e) {
                    console.log(e);
                  }
                }
              }
            }
          }
          break;
        }
        default: {
          console.log(body);
        }
      }
    }
  }
  res.send('hello');
}



export const createOrderQuickpay = async (orderId: number, paymentId: any = null) => {
  let newOrderQuickpay: any = {
    order_id: orderId,
    payment_id: paymentId,
  };
  newOrderQuickpay = await insertOne(newOrderQuickpay, 'order_quickpay');
  return newOrderQuickpay;
}