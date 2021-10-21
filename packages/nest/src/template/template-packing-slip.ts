import { convertUnixTime, formatCurrency } from '../helper/general.helper';
import { PAYMENT_METHOD } from '../config/constants';
import { CheckBox } from './utils/check-box';
import { Barcode } from './utils/barcode';
import getConfig from '../config/config';
const fs = require('fs');

const config = getConfig();

export const docPackingSlip = (order, customer, settings = null, options = { orderForm: true, orderBakery: false, }) => {
  const settingsReplacementOrdinary = settings?.find(e => e.key === 'replacement_normal_goods_info_text');
  const settingsReplacementMilk = settings?.find(e => e.key === 'replacement_milk_and_bread_info_text');
  const settingsReplacementPromotion = settings?.find(e => e.key === 'replacement_promotional_goods_info_text');
  const docDefinition = {
    content: [
      {
        columns: [
          [
            {
              style: 'headerInfo',
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      text: 'Kunder',
                      border: [false, false, false, true],
                    },
                  ],
                ],
              },
            },
            {
              style: 'tableInfo',
              table: {
                widths: [80, '*'],
                body: [
                  [
                    { text: 'Navn', style: 'tableCellInfo', },
                    { text: order.customer_name, style: 'tableCellInfo', },
                  ],
                  [
                    { text: 'Adresse', style: 'tableCellInfo', },
                    { text: order.address_info?.address, style: 'tableCellInfo', },
                  ],
                  [
                    { text: 'Postnr. / by', style: 'tableCellInfo', },
                    { text: `${order.address_info?.zip_code ?? ''} ${order.address_info?.city ?? ''}`, style: 'tableCellInfo', },
                  ],
                  [
                    { text: 'Telefon', style: 'tableCellInfo', },
                    { text: order.phone?.map(phone => `${phone}`) ?? '', style: 'tableCellInfo', },
                  ],
                  [
                    { text: 'Kundenr.', style: 'tableCellInfo', },
                    Barcode(order.store_customer_number, 'tableCellCenterInfo'),
                  ],
                  [
                    { text: 'Medlemskort stregkodenr.', style: 'tableCellInfo', },
                    Barcode(order.membership_number, 'tableCellCenterInfo'),
                  ],
                ],
              },
            },
          ],
          [
            {
              style: 'headerInfo',
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      text: 'Brugs',
                      border: [false, false, false, true],
                    },
                  ],
                ],
              },
            },
            {
              style: 'tableInfo',
              table: {
                widths: [80, '*'],
                body: [
                  [
                    { text: 'Navn', style: 'tableCellInfo', },
                    { text: order.store?.name ?? '', style: 'tableCellInfo', },
                  ],
                ],
              },
            },
            {
              style: 'headerInfo',
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      text: 'Bestillings oplysninger',
                      border: [false, false, false, true],
                    },
                  ],
                ],
              },
            },
            {
              style: 'tableInfo',
              table: {
                widths: [80, '*'],
                body: [
                  ...(options.orderBakery ? [
                    [
                      { text: 'Kørenr', style: 'tableCellBoldInfo', },
                      { text: order.shipping_code, style: 'tableCellBoldInfo', },
                    ],
                    [
                      { text: 'Postnr.', style: 'tableCellBoldInfo', },
                      { text: order.address_info?.zip_code ?? '', style: 'tableCellBoldInfo', },
                    ],
                  ] : []),
                  [
                    { text: 'Ordre nr.', style: 'tableCellInfo', },
                    { text: order._id, style: 'tableCellInfo', },
                  ],
                  [
                    { text: 'Oprettet', style: 'tableCellInfo', },
                    { text: convertUnixTime(order.created_date), style: 'tableCellInfo', },
                  ],
                  [
                    { text: 'Oprettet af', style: 'tableCellInfo', },
                    { text: order.order_by?.name ?? '', style: 'tableCellInfo', },
                  ],
                  ...(options.orderBakery ? [] : [[
                    { text: 'Kørenr.', style: 'tableCellInfo', },
                    { text: order.shipping_code, style: 'tableCellInfo', },
                  ]]),
                ],
              },
            },
          ],
        ],
      },
      {
        style: 'tableInfo',
        table: {
          widths: ['auto', 10],
          body: [
            [
              { text: settingsReplacementOrdinary?.name ?? '', style: 'tableCellInfo', },
              {
                style: 'tableCellInfo',
                svg: CheckBox({ checked: typeof order.replacement_goods === 'object' ? order.replacement_goods['ordinary'] ?? false : false, border: false }),
              },
            ],
            [
              { text: settingsReplacementMilk?.name ?? '', style: 'tableCellInfo', },
              {
                style: 'tableCellInfo',
                svg: CheckBox({ checked: typeof order.replacement_goods === 'object' ? order.replacement_goods['milk_and_bread'] ?? false : false, border: false }),
              },
            ],
            [
              { text: settingsReplacementPromotion?.name ?? '', style: 'tableCellInfo', },
              {
                style: 'tableCellInfo',
                svg: CheckBox({ checked: typeof order.replacement_goods === 'object' ? order.replacement_goods['promotion'] ?? false : false, border: false }),
              },
            ],
          ],
        },
      },
      order.admin_comment ? {
        style: 'note',
        table: {
          widths: ['*'],
          body: [
            [
              { text: order.admin_comment, style: 'tableCellInfo', }
            ],
          ],
        },
      } : null,
      order.note ? {
        style: 'note',
        table: {
          widths: ['*'],
          body: [
            [
              { text: order.note, style: 'tableCellInfo', }
            ],
          ],
        },
      } : null,
      {
        text: `Betalingsmetode: ${PAYMENT_METHOD[order.payment_method]?.label ?? order.payment_method}`,
        margin: [0, 0, 0, 10],
      },
      {
        style: 'header',
        text: 'VISITATION',
      },
      {
        style: 'headerInfo',
        table: {
          widths: ['*'],
          body: [
            [
              {
                text: 'Bestilling',
                border: [false, false, false, true],
              },
            ],
          ],
        },
      },
      {
        style: 'tableProduct',
        table: {
          headerRows: 1,
          widths: [30, '*', '*', 80, 40, 33, 33,],
          body: [
            [
              { text: 'Antal', alignment: 'right', style: 'tableHeader', border: [false, false, false, true], },
              { text: 'Produkt', style: 'tableHeader', border: [false, false, false, true], },
              { text: 'Kommentar', style: 'tableHeader', border: [false, false, false, true], },
              { text: 'Enhed/Stregkode', style: 'tableHeader', border: [false, false, false, true], },
              { text: 'Varenr', alignment: 'right', style: 'tableHeader', border: [false, false, false, true], },
              { text: 'Pris', alignment: 'right', style: 'tableHeader', border: [false, false, false, true], },
              { text: 'Total', alignment: 'right', style: 'tableHeader', border: [false, false, false, true], },
            ],
            ...((options.orderBakery ? order.bakery_product_list : order.product_list).reduce((rows, prod) => {
              rows.push([
                { text: prod.quantity, alignment: 'right', fontSize: 20, style: 'tableCellProd', border: prod.discount ? undefined : [false, false, false, true], },
                { text: prod.name, style: 'tableCellProd', border: prod.discount ? undefined : [false, false, false, true], },
                { text: prod.note, style: 'tableCellProd', border: prod.discount ? undefined : [false, false, false, true], },
                { text: `${prod.unit ?? ''}\n\n${prod.barcode ?? ''}`, style: 'tableCellProd', border: prod.discount ? undefined : [false, false, false, true], },
                { text: prod.item_number?.[0] ?? '', alignment: 'right', style: 'tableCellProd', border: prod.discount ? undefined : [false, false, false, true], },
                { text: formatCurrency(prod.price), alignment: 'right', style: 'tableCellProd', border: prod.discount ? undefined : [false, false, false, true], },
                { text: formatCurrency(prod.price * prod.quantity), alignment: 'right', style: 'tableCellProd', border: prod.discount ? undefined : [false, false, false, true], },
              ]);
              if (prod.discount > 0) {
                rows.push([
                  { text: '', border: [false, false, false, true] },
                  { text: `Rabat på ${prod.name}`, style: 'tableCellProd', colSpan: 3, border: [false, false, false, true], },
                  '',
                  '',
                  { text: prod.discount_quantity, alignment: 'right', style: 'tableCellProd', border: [false, false, false, true], },
                  { text: formatCurrency(-prod.discount), alignment: 'right', style: 'tableCellProd', colSpan: 2, border: [false, false, false, true], },
                  '',
                ]);
              }
              return rows;
            }, [])),
          ],
        },
        layout: {
          defaultBorder: false,
        }
      },
      ...(!options.orderForm ? [] :
        [
          {
            style: 'header',
            text: 'EGEBJERG KØBMANDSGÅRD A/S',
            pageBreak: 'before',
          },
          {
            style: 'tableExample',
            table: {
              headerRows: 1,
              widths: [40, '*', 30, 40, '*', 30,],
              body: [
                [
                  { text: 'Varenr', style: 'tableCellInfo', },
                  { text: 'Navn', style: 'tableCellInfo', },
                  { text: 'Antal', style: 'tableCellInfo', },
                  { text: 'Varenr', style: 'tableCellInfo', },
                  { text: 'Navn', style: 'tableCellInfo', },
                  { text: 'Antal', style: 'tableCellInfo', },
                ],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
                ['', '', '', '', '', '',],
              ],
              heights: function (row) {
                return 16;
              },
            }
          },
          {
            columns: [
              [
                {
                  text: customer.name,
                  margin: [0, 0, 0, 5],
                },
                {
                  text: customer.address,
                  margin: [0, 0, 0, 5],
                },
                {
                  text: `${customer.zip_code.zip_code}, ${customer.zip_code.city_name}`,
                  margin: [0, 0, 0, 5],
                },
                {
                  text: `Telefon: ${customer.phone?.map((phone) => `${phone}`).join(',')}`,
                  margin: [0, 0, 0, 5],
                },
              ],
              [
                {
                  text: `Kommune: ${customer.zip_code.municipality_name}`,
                  margin: [0, 0, 0, 5],
                },
                {
                  text: 'Hjælpers navn:',
                  margin: [0, 0, 0, 5],
                },
                {
                  text: '________________________________',
                  margin: [0, 0, 0, 10],
                },
                {
                  text: 'Hjælpers tlf.nr.:',
                  margin: [0, 0, 0, 5],
                },
                {
                  text: '________________________________',
                },
              ]
            ]
          },
          {
            margin: [0, 10, 0, 0],
            columns: [
              [
                {
                  text: 'Sæt kryds i rubrik:'
                },
                {
                  style: 'tableInfo',
                  table: {
                    widths: ['auto', 10],
                    body: [
                      [
                        {
                          style: 'tableCellInfo',
                          text: settingsReplacementOrdinary?.name ?? '',
                        },
                        { svg: CheckBox({ checked: false }), },
                      ],
                      [
                        {
                          style: 'tableCellInfo',
                          text: settingsReplacementMilk?.name ?? '',
                        },
                        { svg: CheckBox({ checked: false }), },
                      ],
                      [
                        {
                          style: 'tableCellInfo',
                          text: settingsReplacementPromotion?.name ?? '',
                        },
                        { svg: CheckBox({ checked: false }), },
                      ],
                    ],
                  },
                  layout: 'noBorders',
                }
              ],
              [
                {
                  alignment: 'center',
                  image: 'logo',
                  width: 200,
                  margin: [0, 10]
                },
                {
                  text: 'Fax indkøbsliste til: 5991 4647',
                  margin: [0, 0, 0, 5],
                },
                {
                  text: 'Ved evt. spørgsmål - ring til 7025 8888',
                  margin: [0, 0, 0, 5],
                },
                {
                  text: 'E-mail: info@egebjergkobmandsgaard.dk',
                  margin: [0, 0, 0, 5],
                },
              ],
            ],
          },
        ]),
    ],
    styles: {
      headerInfo: {
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      tableInfo: {
        margin: [0, 0, 0, 10],
      },
      tableCellBoldInfo: {
        bold: true,
        fontSize: 12,
        margin: [0, 3, 0, 3],
      },
      tableCellInfo: {
        margin: [0, 3, 0, 3],
      },
      tableCellCenterInfo: {
        alignment: 'center',
        margin: [0, 3, 0, 3],
      },
      tableHeader: {
        margin: [0, -10, 0, 0],
        bold: true,
      },
      tableCellProd: {
        margin: [0, 10, 0, 10],
      },
      note: {
        margin: [0, 0, 0, 10],
      },
      header: {
        fontSize: 20,
        bold: true,
        alignment: 'center',
      },
      tableExample: {
        margin: [0, 10],
      },
      image: {
        alignment: 'center',
        margin: [0, 10],
      },
    },
    defaultStyle: {
      font: 'Ubuntu',
      fontSize: 10,
      columnGap: 20,
    },
    images: {
      logo: `${config.assetsPath}/logo-outline-black.png`,
    },
    footer: function (currentPage, pageCount) {
      return {
        alignment: 'center',
        text: `${currentPage} / ${pageCount}`
      };
    },
  }
  return docDefinition;
}