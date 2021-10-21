const JsBarcode = require('jsbarcode');
const { createCanvas } = require("canvas");

const BarcodeOption = {
  margin: 0,
  format: 'EAN13',
};

export const drawBarCode = (value, option = BarcodeOption) => {
  let canvas = createCanvas();
  JsBarcode(canvas, value, option);
  return canvas.toDataURL('image/png');
};


export const Barcode = (barcode, style) => {
  try {
    return barcode && `${barcode}`.length === 13 ? (
      [
        {
          image: drawBarCode(`${barcode}`),
          width: 100,
          style,
        },
        {
          text: barcode,
          style,
        }
      ]
    ) : {
      text: barcode,
      style,
    };
  } catch (e) {
    console.error('barcode error', barcode)
    return {
      text: barcode,
      style,
    };
  }
};