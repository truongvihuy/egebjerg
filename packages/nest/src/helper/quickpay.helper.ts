import axios from 'axios';
const FormData = require('form-data');
const QUICK_PAY_API = 'https://api.quickpay.net';
const paymentMethodList = 'dankort, visa, 3d-visa, 3d-dankort';
const getAuthToken = (apiKey) => 'Basic ' + Buffer.from(':' + apiKey).toString('base64');
export const claimPayment = async (apiKey: string, paymentId: number, amount: number) => {
  if (!apiKey) {
    return null;
  }
  amount = amount * 100;//ore
  const authToken = getAuthToken(apiKey);
  try {
    var dataPost = new FormData();
    dataPost.append('amount', amount);
    let payment = (await axios.post(`${QUICK_PAY_API}/payments/${paymentId}/capture?synchronized`, dataPost, {
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10',
        ...dataPost.getHeaders(),
      }
    })).data;

    const resultClaim = payment.operations[payment.operations.length - 1];
    return (resultClaim.type == 'capture' && resultClaim.qp_status_code == '20000' && resultClaim.aq_status_code == '20000');
  } catch (e) {
    return null;
  }
}

export const refundPayment = async (apiKey: string, paymentId: number, amount: number) => {
  if (!apiKey) {
    return null;
  }
  amount = amount * 100;//ore
  const authToken = getAuthToken(apiKey);
  try {
    var dataPost = new FormData();
    dataPost.append('amount', amount);
    let payment = (await axios.post(`${QUICK_PAY_API}/payments/${paymentId}/refund?synchronized`, dataPost, {
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10',
        ...dataPost.getHeaders(),
      }
    })).data;

    const resultRefund = payment.operations[payment.operations.length - 1];
    return (resultRefund.type == 'refund' && resultRefund.qp_status_code == '20000' && resultRefund.aq_status_code == '20000');
  } catch (e) {
    return null;
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

export const processPayment = async (apiKey: string, orderId: number, amount: number, customer: any = null, paymentId: any = null) => {
  if (!apiKey) {
    return null;
  }
  let result = {
    payment_id: null,
    error_message: null
  };
  //result = {
  // payment_id,
  // error_message
  // }

  if (customer) {
    //create token for auth payment 
    let primaryCard = null;
    if (customer.card) {
      primaryCard = customer.card.find((x: any) => x.type === 'primary');
    }
    if (primaryCard) {
      //quickpay use amount øre
      amount = amount * 100;
      const authToken = getAuthToken(apiKey);
      if (!paymentId) {
        //create payment
        let payment = await createPayment(authToken, orderId);
        result.payment_id = payment.id;
        paymentId = payment.id
      }
      result.payment_id = paymentId;
      //auth payment with card
      //get token
      try {
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

        let resultPayment = (await axios.post(`${QUICK_PAY_API}/payments/${paymentId}/authorize`, dataPost, {
          headers: {
            Authorization: authToken,
            'Accept-Version': 'v10',
            ...dataPost.getHeaders(),
          }
        })).data;
        if (resultPayment.accepted == false && resultPayment.state == 'rejected') {
          result.error_message = 'Payment rejected';
        }
      } catch (e) {
        result.error_message = 'Payment rejected';
      }
    } else {
      result.error_message = 'Payment rejected';
    }
  }
  return result;
}

export const cancelPayment = async (apiKey: string, paymentId: number) => {
  let response = null;
  const authToken = getAuthToken(apiKey);
  try {
    response = await axios.post(`${QUICK_PAY_API}/payments/${paymentId}/cancel`, {}, {
      headers: {
        Authorization: authToken,
        'Accept-Version': 'v10',
      }
    });
  } catch (e) {
    console.log(e);
  }
  return response;
}