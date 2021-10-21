import { plainToClass } from "class-transformer";
import Customer from "./customer.type";

const loadCustomers = (): Customer[] => {
  return plainToClass(Customer, [
    {
      _id: 1,
      name: "Bente Andersen",
      email: "p22625298@demo.com",
      address: [
        {
          id: "12312",
          type: "primary",
          name: "Home",
          info: "Teststreet 777",
          postal_code: "4300",
          city: "Holbæk"
        }
      ],
      contact: [ //tele_phone must be before mobile_phone
        {
          id: "23439",
          type: "tele_phone",
          number: "202-555-0701"
        }, {
          id: "88234",
          type: "mobile_phone",
          number: "202-555-0191",
        }
      ],
      membership_number: null,
      card: [
        {
          id: "179012",
          type: "primary",
          cardType: "paypal",
          name: "Bente Andersen",
          //5019 5555 4444 5555
          lastFourDigit: '5555'
        },
        {
          id: "987234",
          type: "secondary",
          cardType: "visa",
          name: "Bente Andersen",
          //4571 0000 0000 0001
          lastFourDigit: '0001'
        }
      ],
      store: {
          id: '179012',
          name: 'Superbrugsen Lynge',
          address: 'Lynge Bytorv 17',
          city: 'Lynge',
          postal_code: '3540',
          number: '48-163-838',
          email: 'info@lyngebrugs.dk',
          crv: '12937814',
        },
      favorite_list: [1,2,3,4,5],
      most_bought_list : [4,5,6,7,8],
    },
    {
      _id: 2,
      name: "Jonathon Parker Doe ",
      email: "jpdoe@demo.com",
      address: [
        {
          id: "28764",
          type: "primary",
          name: "Home",
          info: "43 Street, 2341 Road Visalia, Ny 24252"
        },
        {
          id: "98242",
          type: "secondary",
          name: "Office",
          info: "29 Eve Street, 543 Evenue Road, Ny 87876"
        }
      ],
      contact: [
        {
          id: "12491",
          type: "primary",
          number: "202-555-0191"
        },
        {
          id: "12462",
          type: "secondary",
          number: "202-555-0191"
        }
      ],
      card: [
        {
          id: "345968",
          cardType: "paypal",
          name: "Jonathon Parker Doe",
          lastFourDigit: '8723'
        },
        {
          id: "989433",
          cardType: "master",
          name: "Jonathon Parker Doe",
          lastFourDigit: '4352'
        },
        {
          id: "787692",
          cardType: "visa",
          name: "Jonathon Parker Doe",
          lastFourDigit: '2398'
        }
      ],
      store: {
          id: '179012',
          name: 'Superbrugsen Lynge',
          address: 'Lynge Bytorv 17',
          city: 'Lynge',
          postal_code: '3540',
          number: '48-163-838',
          email: 'info@lyngebrugs.dk',
          crv: '12937814',
        },
        favorite_list: [1,2,3,4,5],
        most_bought_list : [4,5,6,7,8],
    },
  ]);
};

export default loadCustomers;
