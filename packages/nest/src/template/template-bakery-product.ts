import { convertUnixTime } from '../helper/general.helper';

export const docBakeryProducts = (productList) => {
  return {
    content: [
      {
        style: 'header',
        text: 'Bageri produkter kunde liste',
      },
      {
        table: {
          headerRows: 1,
          widths: [150, 50, '*', 30,],
          body: [
            [
              { text: 'Slutbeløb rapporteret dato', style: 'tableHeader', },
              { text: 'Varenr.', style: 'tableHeader', },
              { text: 'Titel', style: 'tableHeader', },
              { text: 'Antal', style: 'tableHeader', },
            ],
            ...(productList.map((product) => (
              [
                { text: convertUnixTime(product.date, 'dd-MM-yyyy'), style: 'tableCellProd', },
                { text: product.item_number[0], style: 'tableCellProd', },
                { text: product.name, style: 'tableCellProd', },
                { text: product.quantity, style: 'tableCellProd', },
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
    footer: function (currentPage, pageCount) {
      return {
        alignment: 'center',
        text: `${currentPage} / ${pageCount}`
      };
    },
  };
}