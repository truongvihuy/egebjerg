import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { SettingResolver } from './shop/services/setting/setting.resolver';
import { CustomerResolver } from './shop/services/customer/customer.resolver';
import { ProductResolver } from './shop/services/product/product.resolver';
import { PaymentResolver } from './shop/services/payment/payment.resolver';
import { OrderResolver } from './shop/services/order/order.resolver';
import { CouponResolver } from './shop/services/coupon/coupon.resolver';
import { CategoryResolver } from './shop/services/category/category.resolver';
import { VendorResolver } from './shop/services/vendors/vendors.resolver';
import { NewspaperResolver } from './shop/services/newspaper/newspaper.resolver';
import { checkAuthorization } from './shop/helpers/authenticate-helper';
import { handleCallBack } from './shop/helpers/quickpay-helper';
import config from './config/config';

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app: express.Application = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/quickpay', handleCallBack);
const path = '/shop/graphql';
const PORT = process.env.PORT || 4000;
const main = async () => {
  const schema = await buildSchema({
    resolvers: [
      CustomerResolver,
      ProductResolver,
      PaymentResolver,
      OrderResolver,
      CouponResolver,
      CategoryResolver,
      VendorResolver,
      NewspaperResolver,
      SettingResolver
    ],
  });
  const apolloServer = new ApolloServer({
    schema,
    introspection: true,
    playground: true,
    tracing: config.ENABLE_APOLLO_TRACING_EXT,
    context: async ({ req, res }) => {
      return {
        ...(await checkAuthorization(req, res)),
        req,
        res
      }
    }
  });
  apolloServer.applyMiddleware({
    app, path, cors: {
      origin: true,
      credentials: true,
      preflightContinue: false
    },
  });


  app.listen(PORT, () => {
    console.log(`🚀 started http://localhost:${PORT}${path}`);
  });
};

main();
