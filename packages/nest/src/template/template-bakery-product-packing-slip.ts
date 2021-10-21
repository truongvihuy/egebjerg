import { docPackingSlip } from './template-packing-slip';

export const docBakeryProductsPackingSlip = (orderList, settings) => {
  let docDefinition = null;
  orderList.forEach(order => {
    const docTmp = docPackingSlip(order, null, settings, { orderForm: false, orderBakery: true });
    if (docDefinition) {
      docTmp.content[0].pageBreak = 'before';
      docDefinition.content = [...docDefinition.content, ...docTmp.content];
    } else {
      docDefinition = docTmp;
    }
  });
  return docDefinition;
}