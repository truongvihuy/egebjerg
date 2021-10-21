import { convertUnixTime } from '../helper/general.helper';

export const docBakeryProductsCustomerList = (orderBakeryList) => {
  return {
    content: [
      {
        style: 'header',
        text: 'Bageri produkter kunde liste',
      },
      {
        table: {
          headerRows: 1,
          widths: [60, 70, '*', 70, 35, 40, '*', 30, 30, 30,],
          body: [
            [
              { text: 'Slutbeløb rapporteret dato', style: 'tableHeader', },
              { text: 'Brugernavn', style: 'tableHeader', },
              { text: 'Adresse', style: 'tableHeader', },
              { text: 'By', style: 'tableHeader', },
              { text: 'Postnr.', style: 'tableHeader', },
              { text: 'Varenr.', style: 'tableHeader', },
              { text: 'Titel', style: 'tableHeader', },
              { text: 'Pris', style: 'tableHeader', },
              { text: 'Antal', style: 'tableHeader', },
              { text: 'Total', style: 'tableHeader', },
            ],
            ...(orderBakeryList.map((product) => (
              [
                { text: convertUnixTime(product.date, 'dd-MM-yyyy'), style: 'tableCellProd', },
                { text: product.order.customer_name, style: 'tableCellProd', },
                { text: product.order.address_info.address, style: 'tableCellProd', },
                { text: product.order.address_info.city, style: 'tableCellProd', },
                { text: product.order.address_info.zip_code, style: 'tableCellProd', },
                { text: product.item_number[0], style: 'tableCellProd', },
                { text: product.name, style: 'tableCellProd', },
                { text: product.price, style: 'tableCellProd', },
                { text: product.quantity, style: 'tableCellProd', },
                { text: product.total, style: 'tableCellProd', },
              ]
            ))),
          ],
        }
      },
    ],
    styles: {
      header: {
        fontSize: 20,
        margin: [0, 0, 0, 10],
        bold: true,
        alignment: 'center',
      },
      tableHeader: {
        margin: [0, 3, 0, 3],
        bold: true,
      },
      tableCellProd: {
        margin: [0, 3, 0, 3],
      },
    },
    defaultStyle: {
      font: 'Ubuntu',
      fontSize: 10,
      columnGap: 20,
    },
    pageOrientation: 'landscape',
    footer: function (currentPage, pageCount) {
      return {
        alignment: 'center',
        text: `${currentPage} / ${pageCount}`
      };
    },
  };
}