import { plainToClass } from 'class-transformer';
import Order from './order.type';

const loadOrders = (): Order[] => {
  return plainToClass(Order, [
    {
      id: 5,
      customerId: 1,
      amount: 249.7,
      date: 1615279390,
      deliveryAddress: '1756  Roy Alley, GIRARDVILLE, Pennsylvania',
      subtotal: 200,
      discount: 0.0,
      deliveryFee: 49.7,
      products: [
        {
          id: 1,
          title: 'Banana',
          weight: '2lb',
          price: 50,
          image:
            'http://s3.amazonaws.com/redqteam.com/headless-image/banana.jpg',
          quantity: 2,
          total: 100,
        },
        {
          id: 2,
          title: 'Onions',
          image:
            'http://s3.amazonaws.com/redqteam.com/headless-image/onions.jpg',
          weight: '2lb',
          price: 100,
          quantity: 1,
          total: 100,
        },
      ],
      status: 2,
    },
    {
      id: 4,
      customerId: 1,
      amount: 339.0,
      date: 1612860190,
      deliveryAddress: '1756  Roy Alley, GIRARDVILLE, Pennsylvania',
      subtotal: 300.0,
      discount: 0.0,
      deliveryFee: 39.0,
      products: [
        {
          id: 1,
          title: 'Blue Grapes',
          image:
            'http://s3.amazonaws.com/redqteam.com/headless-image/blue_grapes.jpg',
          weight: '2lb',
          price: 150,
          quantity: 1,
          total: 150,
        },
        {
          id: 2,
          title: 'Coconut',
          image:
            'http://s3.amazonaws.com/redqteam.com/headless-image/cocnut.jpg',
          weight: '2lb',
          price: 150,
          quantity: 1,
          total: 150,
        },
      ],
      status: 1,
    },
    {
      id: 3,
      customerId: 1,
      amount: 318.0,
      date: 1609576990,
      deliveryAddress: '1756  Roy Alley, GIRARDVILLE, Pennsylvania',
      subtotal: 279.0,
      discount: 0.0,
      deliveryFee: 39.0,
      products: [
        {
          id: 1,
          title: 'Garlic',
          image:
            'http://s3.amazonaws.com/redqteam.com/headless-image/garlic.jpg',
          weight: '2lb',
          price: 140,
          quantity: 1,
          total: 140,
        },
        {
          id: 2,
          title: 'Green Apple',
          image:
            'http://s3.amazonaws.com/redqteam.com/headless-image/Green_Apple.jpg',
          weight: '2lb',
          price: 139,
          quantity: 1,
          total: 139,
        },
      ],
      status: 3,
    },
    {
      id: 2,
      customerId: 1,
      amount: 339.0,
      date: 1606898590,
      deliveryAddress: '1756  Roy Alley, GIRARDVILLE, Pennsylvania',
      subtotal: 300,
      discount: 0.0,
      deliveryFee: 39.0,
      products: [
        {
          id: 1,
          title: 'Guava',
          image:
            'http://s3.amazonaws.com/redqteam.com/headless-image/guava.jpg',
          weight: '2lb',
          price: 100,
          quantity: 3,
          total: 300,
        },
      ],
      status: 2,
    },
    {
      id: 1,
      customerId: 1,
      amount: 326.0,
      date: 1605169210,
      deliveryAddress: '1756  Roy Alley, GIRARDVILLE, Pennsylvania',
      subtotal: 287.0,
      discount: 0.0,
      deliveryFee: 39.0,
      products: [
        {
          id: 1,
          title: 'Oranges',
          image:
            'http://s3.amazonaws.com/redqteam.com/headless-image/oranges.jpg',
          weight: '2lb',
          price: 100,
          quantity: 2,
          total: 200,
        },
        {
          id: 2,
          title: 'Pepper',
          image:
            'http://s3.amazonaws.com/redqteam.com/headless-image/pepper.jpg',
          weight: '2lb',
          price: 87,
          quantity: 1,
          total: 87,
        },
      ],
      status: 1,
    },
  ]);
};

export default loadOrders;
