import JsBarcode from 'jsbarcode';

const BarcodeOption = {
  margin: 0,
  format: 'EAN13',
};

export const drawBarCode = (value, option = BarcodeOption) => {
  var canvas = document.createElement('canvas');
  JsBarcode(canvas, value, option);
  return canvas.toDataURL('image/png');
};