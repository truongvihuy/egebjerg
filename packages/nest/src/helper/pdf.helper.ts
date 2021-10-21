import getConfig from '../config/config';
const PdfPrinter = require('pdfmake');
const fs = require('fs');

const config = getConfig();

const fonts = {
  Ubuntu: {
    normal: `${config.assetsPath}/fonts/ubuntu-latin-400.woff`,
    bold: `${config.assetsPath}/fonts/ubuntu-latin-500.woff`,
    italics: `${config.assetsPath}/fonts/ubuntu-latin-400italic.woff`,
    bolditalics: `${config.assetsPath}/fonts/ubuntu-latin-500italic.woff`,
  },
};

export const createPDF = (docDefinition: any) => {
  return new Promise(resolve => {
    let printer = new PdfPrinter(fonts);
    let pdfDoc = printer.createPdfKitDocument(docDefinition);
    // this code will save pdf file to test 
    // pdfDoc.pipe(fs.createWriteStream('./basics.pdf'));

    let chunks = [];
    let result;

    pdfDoc.on('data', function (chunk) {
      chunks.push(chunk);
    });
    pdfDoc.on('end', function () {
      result = Buffer.concat(chunks);
      resolve('data:application/pdf;base64,' + result.toString('base64'));
    });
    pdfDoc.end();
  });
}