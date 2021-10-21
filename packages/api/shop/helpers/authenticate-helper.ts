const jwt = require('jsonwebtoken');
import { ApolloError, AuthenticationError } from 'apollo-server-express';
import config from '../../config/config'
import { getDb } from '../../helper/db.helper';
import { getNow } from '../../../share/time.helper';
import { CUSTOMER_TYPE } from '../../../share/constant';
import { YOU_MUST_BE_LOGGED_IN, MSG_SYSTEM_ERROR, PASSWORD_IS_WRONG } from '../../config/constant';
const crypto = require('crypto-js');
const bcrypt = require('bcrypt');

const verifyJWT = (token: string) => {
  return jwt.verify(token, config.JWT_SECRET, (err: any, decoded: any) => {
    return {
      err,
      data: decoded
    }
  });
}
export const checkAuthorization = async (req: any, res: any) => {
  let token = req.headers.authorization || null;
  const now = getNow();
  const deviceName = getUA(req.headers['user-agent']);
  if (!token) {
    if (!!req.cookies.refreshToken) {
      const ignoredOperationList = ['getProducts', 'getCategories', 'getNewspapers'];
      if (ignoredOperationList.includes(req.body.operationName)) {
        // console.log(`Ignore ` + req.body.operationName );
        return {};
      }

      return getNewJwtToken(req.cookies.refreshToken);
    } else {
      return {};
    }
  } else {
    if (token.startsWith('Bearer')) {
      token = token.replace('Bearer ', '');
      let customerJWT = verifyJWT(token);
      if (customerJWT.data) {
        customerJWT = customerJWT.data;
        if (req.body.operationName == 'getCustomer') {
          //get main customer
          let customer = await findAndProcessCustomer({ _id: customerJWT._id });
          //reset refresh token
          const newRefreshToken = encryptAES(`${customerJWT._id}-${deviceName}-${now}`);
          await setNewRefreshToken(customer, req.cookies.refreshToken, newRefreshToken, res);

          return {
            customer
          }
        } else if (req.body.operationName == 'getChildCustomer') {
          if (!!req.body.variables.customer_id) {
            checkCustomerBelong(req.body.variables.customer_id, customerJWT)
            customerJWT.affectedCustomerId = req.body.variables.customer_id;

            const newRefreshToken = encryptAES(`${customerJWT._id}-${deviceName}-${now}-${customerJWT.affectedCustomerId}`);
            await setNewRefreshToken(customerJWT, req.cookies.refreshToken, newRefreshToken, res);

          } else {
            throw new AuthenticationError("Customer Id is missing");
          }

          let jwtToken = jwt.sign(
            customerJWT,
            config.JWT_SECRET
          );

          return {
            customer: {
              ...customerJWT,
            },
            accessToken: jwtToken,
          }
        } else {
          return {
            customer: customerJWT
          }
        }
      } else if (customerJWT.err.name == 'TokenExpiredError' && !!req.cookies.refreshToken) {
        return getNewJwtToken(req.cookies.refreshToken);
      } else {
        throw new AuthenticationError(YOU_MUST_BE_LOGGED_IN);
      }
    }

    if (token.startsWith('Basic')) {
      if (!config.REFRESH_TOKEN_EXPIRE_LIMIT || !config.JWT_EXPIRE_LIMIT) {
        throw new AuthenticationError(MSG_SYSTEM_ERROR);
      }

      //login
      token = token.replace('Basic ', '');
      let query = Buffer.from(token, 'base64').toString('binary').split(':');
      let customer = await findAndProcessCustomer({
        '$or': [
          {
            'email': query[0],
          },
          {
            'username': query[0],
          },
        ]
      }, true);
      if (customer) {
        //match password 
        const match = await bcrypt.compare(query[1], customer.password);
        if (match) {
          let sessionId = now;
          let customerJWT = {
            _id: customer._id,
            username: customer.username,
            name: customer.name,
            customer_list: customer.customer_list,
            store_id: customer.store_id,
          };
          let jwtToken = jwt.sign(
            {
              ...customerJWT,
              exp: now + config.JWT_EXPIRE_LIMIT,
              _id: customer._id,
              username: customer.username,
              name: customer.name,
              customer_list: customer.customer_list,
              affectedCustomerId: customer._id,
              sessionId,
              type: customer.type
            },
            config.JWT_SECRET
          );
          const refreshToken = encryptAES(`${customer._id}-${deviceName}-${now}`);
          setRefreshTokenCookie(refreshToken, res);
          //update customer
          let setObject: any = {};
          if (!!customer.session) {
            setObject[`session.${refreshToken}`] = now + config.REFRESH_TOKEN_EXPIRE_LIMIT;
          } else {
            setObject = {
              session: {
                [refreshToken]: now + config.REFRESH_TOKEN_EXPIRE_LIMIT
              }
            }
          }

          let db = await getDb();
          await db.collection('customer').updateOne({
            _id: customer._id,
          }, {
            '$set': setObject
          });

          return {
            customer,
            accessToken: jwtToken,
          }
        } else {
          throw new AuthenticationError(PASSWORD_IS_WRONG);
        }
      } else {
        throw new AuthenticationError(YOU_MUST_BE_LOGGED_IN);
      }

    }
    return {};
  }
}

export const checkCustomerBelong = (customerId: any, parentCustomer: any) => {
  if (!parentCustomer.customer_list || !parentCustomer.customer_list.map((x: any) => x._id).includes(customerId)) {
    throw new AuthenticationError('This customer not belong to you');
  }
  return true;
}

const encryptAES = (text: string) => {
  let encrypted = crypto.AES.encrypt(text, config.JWT_SECRET).toString();
  return encrypted;
}
const decryptAES = (text: string) => {
  let bytesDecrypted = crypto.AES.decrypt(text, config.JWT_SECRET);
  return bytesDecrypted.toString(crypto.enc.Utf8);
}


export const getUA = (userAgent: string) => {
  let device = "Unknown";
  const ua: any = {
    "Generic Linux": /Linux/i,
    "Android": /Android/i,
    "BlackBerry": /BlackBerry/i,
    "Bluebird": /EF500/i,
    "Chrome OS": /CrOS/i,
    "Datalogic": /DL-AXIS/i,
    "Honeywell": /CT50/i,
    "iPad": /iPad/i,
    "iPhone": /iPhone/i,
    "iPod": /iPod/i,
    "macOS": /Macintosh/i,
    "Windows": /IEMobile|Windows/i,
    "Zebra": /TC70|TC55/i,
  }

  Object.keys(ua).map(v => userAgent.match(ua[v]) && (device = v));
  return device;
}

const getNewJwtToken = async (refreshToken: string) => {
  const now = getNow();
  let sessionId = now;
  let condition: any = {};
  condition[`session.${refreshToken}`] = {
    '$gte': now
  }
  let customer = await findAndProcessCustomer(condition);
  if (customer) {
    let customerJWT = {
      _id: customer._id,
      username: customer.username,
      name: customer.name,
      customer_list: customer.customer_list,
      type: customer.type,
      store_id: customer.store_id,
    };
    let customerChild = null;
    //Must return child customer info when customer is GROUP_ADMIN
    if (customer.type === CUSTOMER_TYPE.GROUP_ADMIN) {
      let decryptResult = decryptAES(refreshToken);
      //const newRefreshToken = encryptAES(`${customerJWT._id}-${deviceName}-${now}-${customerJWT.affectedCustomerId}`);
      let affectedCustomerId = decryptResult.split('-')[3] ?? null;
      affectedCustomerId = parseInt(affectedCustomerId);
      if (affectedCustomerId) {
        customerChild = await findAndProcessCustomer({ _id: affectedCustomerId });
      }
    }
    let jwtToken = jwt.sign(
      {
        ...customerJWT,
        exp: now + config.JWT_EXPIRE_LIMIT,
        sessionId,
        affectedCustomerId: customerChild ? customerChild._id : customer._id,
        store_id: customerChild ? customerChild.store_id : customer.store_id,
        type: customer.type
      },
      config.JWT_SECRET
    );
    return {
      customer: customerChild ?? customer,
      accessToken: jwtToken
    }
  } else {
    //remove refresh token
    let db = await getDb();
    condition[`session.${refreshToken}`] = {
      '$ne': null
    };
    let unsetObject: any = {};
    unsetObject[`session.${refreshToken}`] = 1;

    await db.collection('user').updateOne(condition, {
      '$unset': unsetObject
    });
    throw new ApolloError('Invalid/Expired Refresh Token', 'INVALID/EXPIRED_REFRESH_TOKEN');
  }
}

export const findAndProcessCustomer = async (condition: any, projectPassword: boolean = false) => {
  let db = await getDb();
  let projection: any = {
    projection: 0
  }
  if (!projectPassword) {
    projection = {
      'password': 0
    }
  }
  let customer = await db.collection('customer').aggregate([
    { '$match': condition },
    { '$project': projection },
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
          '$arrayElemAt': ['$store', 0]
        },
        zip_code: {
          '$arrayElemAt': ['$zip_code', 0]
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
  if (customer) {
    customer.customer_list = customer?.customer_list ? Object.values(customer.customer_list) : null;
    return customer;
  }

  return null;
}

export const checkCustomerContext = (context: any, customerId: number | null = null) => {
  if (!context.customer) {
    throw new AuthenticationError(YOU_MUST_BE_LOGGED_IN);
  } else if (customerId) {
    checkCustomerBelong(customerId, context.customer)
  }
}

const setRefreshTokenCookie = (refreshToken: any, res: any) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    expires: new Date((getNow() + config.REFRESH_TOKEN_EXPIRE_LIMIT) * 1000)
  });
}

const setNewRefreshToken = async (customer: any, oldRefreshToken: string, newRefreshToken: string, res: any) => {
  if (customer.type === CUSTOMER_TYPE.GROUP_ADMIN) {
    const now = getNow();
    const setObject: any = {};
    setObject[`session.${newRefreshToken}`] = now + config.REFRESH_TOKEN_EXPIRE_LIMIT;
    const unsetObject: any = {};
    unsetObject[`session.${oldRefreshToken}`] = 1;
    let db = await getDb();
    await db.collection('customer').updateOne({
      _id: customer._id,
    }, {
      '$set': setObject,
      '$unset': unsetObject
    });
    await setRefreshTokenCookie(newRefreshToken, res);
  }
}