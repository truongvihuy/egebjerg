import { OFFER_TYPE, SPECIAL_PRODUCT_ID_LIST } from './constant';
import { checkMembership } from './customer.helper';
import { isFreeNameProduct, formatCurrency } from './general.helper';

export const getPriceInStore = (customer: any, product: any) => {
  let store_price = product.store_price_list?.find((e: any) => e.store_id === customer?.store_id);
  if (store_price) {
    return store_price.price;
  }
  return product.price;
}

const processProduct = (item: any, customer: any) => {
  let product: any = { ...item.product };

  if (isFreeNameProduct(item.cart._id)) {
    product = {
      ...item.product,
      name: item.cart.name,
      price: item.cart.price ?? item.product.price
    };
  } else {
    product.price = getPriceInStore(customer, product);
  }

  if (product.weight_list?.length) {
    if (!product.weight_list.includes(item.cart.weight_option)) {
      item.cart.weight_option = product.weight_list[0];
    }
  } else {
    delete item.cart.weight_option;
  }

  product.price_weight_option = product.weight_list?.length ? (item.cart.weight_option * product.price / product.base_value) : product.price;
  product.weight_option = item.cart.weight_option ?? product.weight;

  return product;
};

export const checkProductStock = (product: any, customer: any = null) => {
  if (!customer) return true;
  return product.store_id_list?.includes(customer?.store_id);
};

export const processOrderItemList = (items: any, customer: any, orderInfo: any = null, throwError: boolean = false) => {
  const comboOfferMap: any = {}; // list item 
  let products: any = []; // list of items displayed on the shopping cart
  let originTotalPrice: number = 0;
  let totalWeight: number = 0;
  let errorOrder: string = '';

  const handlePushList = (product: any, cart: any, associated_list: any[], productList = products) => {
    productList.push({
      ...cart,
      image: product.image,
      slug: product.slug,
      price: product.price,
      price_weight_option: product.price_weight_option,
      weight: product.weight,
      unit: product.unit,
      barcode: product.barcode,
      item_number: product.item_number,
      is_baked: product.is_baked,
      name: product.name ?? cart.name,
    });
    associated_list?.forEach((element: any) => {
      if (!checkProductStock(element, customer)) {
        return;
      }

      const cartAssociatedItem = {
        _id: element._id,
        position: cart.position,
        quantity: cart.quantity * element.amount,
        associated_item_id: cart._id,
        is_baked_associated_item: product.is_baked,
      }
      const productAssociatedItem = processProduct({ product: element, cart: cartAssociatedItem }, customer);
      originTotalPrice += productAssociatedItem.price_weight_option * cartAssociatedItem.quantity;
      totalWeight += productAssociatedItem.weight_option * cartAssociatedItem.quantity;
      productList.push({
        ...cartAssociatedItem,
        name: productAssociatedItem.name,
        image: productAssociatedItem.image,
        slug: productAssociatedItem.slug,
        price: productAssociatedItem.price,
        price_weight_option: productAssociatedItem.price_weight_option,
        weight: productAssociatedItem.weight,
        unit: productAssociatedItem.unit,
        barcode: productAssociatedItem.barcode,
        item_number: productAssociatedItem.item_number,
        is_baked: productAssociatedItem.is_baked,
        total: productAssociatedItem.price_weight_option * cartAssociatedItem.quantity,
      });
    });
  };
  // const conditionSort = (x: any, y: any) => (x.position - y.position) !== 0 ? x.position - y.position : ((!!x.associated_item_id) !== (!!y.associated_item_id) ? (x.associated_item_id ? 1 : -1) : 0);
  const conditionSort = (x: any, y: any) => {
    const haveSpecialProduct = +SPECIAL_PRODUCT_ID_LIST.includes(y._id) - +SPECIAL_PRODUCT_ID_LIST.includes(x._id);
    return haveSpecialProduct === 0 ? x.position - y.position : haveSpecialProduct;
  };
  const addGroupTag = (products: any[], func: any = null) => {
    let length = products.length;
    products.forEach((e: any, i: number) => {
      if (func) {
        func(e, i);
      }
      e.group = (length === 1 ? 'one' : ((i === 0) ? 'start' : ((length - 1 === i) ? 'end' : 'mid')));
    });
  }

  items.forEach((item: any) => {
    const product = processProduct(item, customer);
    const { cart, associated_list } = item;
    const offer: any = product.offer;

    if (!checkProductStock(product, customer)) {
      errorOrder = errorOrder ? errorOrder : `out_of_stock:${item.product.name}`;
      if (throwError) {
        throw errorOrder;
      }

      products.push({
        ...item.cart,
        name: item.product.name ?? item.cart.name,
        image: item.product.image,
        weight: item.product.weight,
        price: item.product.price,
        barcode: item.product.barcode,
        unit: item.product.unit,
        slug: item.product.slug,
        item_number: item.product.item_number,
        is_baked: item.product.is_baked,
        error: `out_of_stock:${item.product.name}`,
      });
      return;
    }

    originTotalPrice += product.price_weight_option * cart.quantity;
    totalWeight += (product.weight_option) * cart.quantity;
    // calculate the products not included in the combo first
    if (!offer) {
      handlePushList(product, {
        ...cart,
        quantity: cart.quantity,
        total: product.price_weight_option * cart.quantity,
      }, associated_list);
      return;
    }
    switch (offer.type) {
      case OFFER_TYPE.PRICE: {
        const total = offer.sale_price * cart.quantity;
        handlePushList(product, {
          ...cart,
          discount: (product.price_weight_option * cart.quantity) - total,
          total: total,
          offer: offer,
        }, associated_list);
        break;
      }
      case OFFER_TYPE.LIMIT: {
        let quantity = Math.min(cart.quantity, offer.quantity);
        let total = offer.sale_price * quantity;
        handlePushList(product, {
          ...cart,
          quantity,
          discount: (product.price_weight_option * quantity) - total,
          total,
          offer: offer,
        }, associated_list);
        if (cart.quantity > offer.quantity) {
          // when the customer chooses more than the limited quantity, the original price is calculated
          quantity = cart.quantity - offer.quantity;
          handlePushList(product, {
            ...cart,
            quantity,
            total: product.price_weight_option * quantity,
            offer
          }, associated_list);
        }
        break;
      }
      case OFFER_TYPE.MEMBER: {
        let total, discount;
        if (checkMembership(customer)) {
          // calculate sale price when is membership
          total = offer.sale_price * cart.quantity;
          discount = (product.price_weight_option * cart.quantity) - total;
        } else {
          total = product.price_weight_option * cart.quantity;
        }
        handlePushList(product, {
          ...cart,
          discount,
          total,
          offer,
        }, associated_list);
        break;
      }
      case OFFER_TYPE.QUANTITY: {
        const numberOfferGroup = ~~(cart.quantity / offer.quantity);
        const remainingQuantity = cart.quantity % offer.quantity
        if (numberOfferGroup) {
          // Get the maximum number of incentives available
          const quantity = numberOfferGroup * offer.quantity;
          const total = numberOfferGroup * offer.sale_price;
          handlePushList(product, {
            ...cart,
            quantity,
            discount: (product.price_weight_option * quantity) - total,
            total,
            offer,
          }, associated_list);
        }
        if (remainingQuantity) {
          // Taking the remaining amount does not apply to the offer
          handlePushList(product, {
            ...cart,
            quantity: remainingQuantity,
            total: product.price_weight_option * remainingQuantity,
            offer,
          }, associated_list);
        }
        break;
      }
      case OFFER_TYPE.LIMIT_COMBO:
      case OFFER_TYPE.COMBO: {
        // push combo offer map to recalculate
        if (!comboOfferMap[offer._id]) {
          comboOfferMap[offer._id] = [];
        }
        comboOfferMap[offer._id].push({
          product,
          cart,
          associated_list,
        });
        break;
      }
      default:
    }
  });
  if (Object.keys(comboOfferMap).length) {
    // calculation in combo list
    Object.keys(comboOfferMap).forEach(_id => {
      // arrange products in combos with lower prices
      comboOfferMap[_id].sort((a: any, b: any) => b.product.price_weight_option - a.product.price_weight_option);
      const offer = comboOfferMap[_id][0].product.offer;
      if (OFFER_TYPE.COMBO === offer.type) {
        let productListInCombo: any = []; // productListInCombo is temporary product list to count the number of products
        // 'quantityProducstInCombo' is number of products in productListInCombo
        // 'totalOriginPriceinCombo' is total origin price in productListInCombo
        let quantityProducstInCombo: number = 0, totalOriginPriceinCombo: number = 0;
        comboOfferMap[_id].forEach((item: any) => {
          const { product, cart, associated_list } = item;
          let currentQuantity = cart.quantity;
          while (currentQuantity) {
            if (quantityProducstInCombo === 0) {
              // productListInCombo empty, calculates the same price as offer type quantity
              if (~~(currentQuantity / offer.quantity)) {
                // Get the maximum number of incentives available
                if (offer.quantity * product.price_weight_option > offer.sale_price) {
                  // forms a group of 1 item when the combo price is less than the original price
                  const quantity = currentQuantity - (currentQuantity % offer.quantity),
                    total = (~~(currentQuantity / offer.quantity)) * offer.sale_price;
                  let groupTmp: any[] = [];
                  handlePushList(product, {
                    ...cart,
                    quantity,
                    discount: (product.price_weight_option * quantity) - total,
                    total,
                    offer,
                  }, associated_list, groupTmp);
                  addGroupTag(groupTmp);
                  products.push(groupTmp);
                  // forms a group of 1 item when the combo price is less than the original price
                  currentQuantity -= quantity;
                } else {
                  // for all the remaining quantity in the list displayed when the combo price is greater than the original price
                  handlePushList(product, {
                    ...cart,
                    quantity: currentQuantity,
                    total: product.price_weight_option * currentQuantity,
                    offer,
                  }, associated_list);
                  currentQuantity = 0;
                }
              } else {
                quantityProducstInCombo += currentQuantity;
                totalOriginPriceinCombo += (product.price_weight_option * currentQuantity);
                handlePushList(product, {
                  ...cart,
                  quantity: currentQuantity,
                  offer,
                }, associated_list, productListInCombo);
                currentQuantity = 0;
              }
            } else {
              // productListInCombo is not empty
              if (quantityProducstInCombo + currentQuantity < offer.quantity) {
                // the remaining quantity of the product under consideration plus the quantity in the 'productListInCombo' is less than offer.quantity, then add all to the productListInCombo.
                quantityProducstInCombo += currentQuantity;
                totalOriginPriceinCombo += (product.price_weight_option * currentQuantity);
                handlePushList(product, {
                  ...cart,
                  quantity: currentQuantity,
                  offer,
                }, associated_list, productListInCombo);
                currentQuantity = 0;
              } else {
                // when exceeding offer.quantity
                const tmpQuantity = offer.quantity - quantityProducstInCombo; // the amount put in for enough combos
                totalOriginPriceinCombo += (tmpQuantity * product.price_weight_option);
                if (totalOriginPriceinCombo > offer.sale_price) {
                  // The total price is greater than the combo price, the combo price is calculated
                  handlePushList(product, {
                    ...cart,
                    quantity: tmpQuantity,
                    offer,
                  }, associated_list, productListInCombo);
                  currentQuantity -= tmpQuantity;
                  productListInCombo.sort(conditionSort);
                  addGroupTag(productListInCombo, (e: any, i: number) => {
                    e.total = e.total ?? ((offer.sale_price / totalOriginPriceinCombo) * (e.price_weight_option * e.quantity));
                    if (!e.associated_item_id) {
                      e.discount = (e.price_weight_option * e.quantity) - e.total;
                    }
                  });
                  products.push(productListInCombo);
                } else {
                  // The total price is less than the combo price, the combo price will display the original price
                  productListInCombo.forEach((e: any) => {
                    e.total = e.total ?? (e.price_weight_option * e.quantity);
                    products.push(e);
                  });
                  // Add the remaining quantity of product in consideration to the displayed list
                  handlePushList(product, {
                    ...cart,
                    quantity: currentQuantity,
                    total: product.price_weight_option * currentQuantity,
                    offer,
                  }, associated_list);
                  currentQuantity = 0;
                }
                // after grouping, set productListInCombo empty
                productListInCombo = [];
                quantityProducstInCombo = 0;
                totalOriginPriceinCombo = 0;
              }
            }
          }
        });
        // Considering all products in the combo, but the 'productListInCombo' still has the product, the original price will be displayed
        if (productListInCombo.length) {
          productListInCombo.forEach((e: any) => {
            e.total = e.total ?? (e.price_weight_option * e.quantity);
            products.push(e);
          })
        }
      } else {
        let productListInCombo: any = []; // productListInCombo is temporary product list to count the number of products
        let quantityProducstInCombo: number = 0;
        let currentIndexItem: number = 0;
        while (quantityProducstInCombo < offer.quantity && comboOfferMap[_id][currentIndexItem]) {
          const item = comboOfferMap[_id][currentIndexItem];
          const { product, cart, associated_list } = item;
          if (product.price_weight_option > offer.sale_price) {
            if (quantityProducstInCombo + cart.quantity > offer.quantity) {
              // the amount put in for enough combo
              let tmpQuantity = offer.quantity - quantityProducstInCombo;
              handlePushList(product, {
                ...cart,
                quantity: tmpQuantity,
                offer,
              }, associated_list, productListInCombo);
              quantityProducstInCombo = offer.quantity;
            } else {
              // add the entire amount in productListInCombo
              handlePushList(product, {
                ...cart,
                offer,
              }, associated_list, productListInCombo);
              quantityProducstInCombo += cart.quantity;
              currentIndexItem++;
            }
          } else break;  // original price lower than sale price
        }
        let lastItemInCombo = productListInCombo[productListInCombo.length - 1];
        productListInCombo.sort(conditionSort);
        addGroupTag(productListInCombo, (e: any, index: number) => {
          e.total = e.total ?? (offer.sale_price * e.quantity);
          if (!e.associated_item_id) {
            e.discount = (e.price_weight_option * e.quantity) - e.total;
          }
        });
        products.push(productListInCombo);
        if (comboOfferMap[_id][currentIndexItem] && lastItemInCombo && lastItemInCombo._id === comboOfferMap[_id][currentIndexItem].cart._id) {
          const { product, cart, associated_list } = comboOfferMap[_id][currentIndexItem];
          // check the remaining quantity of the product
          const quantity = cart.quantity - lastItemInCombo.quantity;
          handlePushList(product, {
            ...cart,
            quantity,
            total: product.price_weight_option * quantity,
            offer,
          }, associated_list);
          currentIndexItem++;
        }
        while (currentIndexItem < comboOfferMap[_id].length) {
          const { product, cart, associated_list } = comboOfferMap[_id][currentIndexItem];
          // add the remaining products without combos
          handlePushList(product, {
            ...cart,
            total: product.price_weight_option * cart.quantity,
            offer,
          }, associated_list);
          currentIndexItem++;
        }
      }
    });
  }

  products = products.sort((a: any, b: any) => {
    let x = Array.isArray(a) ? a[0] : a;
    let y = Array.isArray(b) ? b[0] : b;
    return conditionSort(x, y);
  }).flat(1);
  let total = products.reduce((total: number, item: any) => {
    total += (item.total ?? 0);
    if (item.total) {
      item.total = Math.round(item.total * 100) / 100;
    }
    if (item.discount) {
      item.discount = Math.round(item.discount * 100) / 100;
    }
    if (item.price) {
      item.price = Math.round(item.price * 100) / 100;
    }
    return total;
  }, 0);
  total = Math.round(total * 100) / 100;

  // handle delivery free
  const deliveryFee = customer?.delivery_fee ? (Math.round(customer.delivery_fee * 100) / 100) : 0;
  if (deliveryFee > 0 && items.length > 0) {
    total += deliveryFee;
    originTotalPrice += deliveryFee;

    products.unshift({
      name: 'Leveringsgebyr',
      price: deliveryFee,
      quantity: 1,
      position: -1,
      total: deliveryFee,
    });
  }

  // handle overweight
  let overweightFee = 0;
  let overweight = 0;
  let isOverweight = false;
  let overweightRate = null;
  if (customer?.municipality?.weight_limit < totalWeight) {
    let price = Math.round(customer.municipality.overweight_price * 100) / 100;
    let quantity = Math.ceil(totalWeight / customer.municipality.weight_limit) - 1;

    overweightFee = price * quantity;
    overweight = totalWeight - customer.municipality.weight_limit;
    total += overweightFee;
    originTotalPrice += overweightFee;

    products.unshift({
      name: 'Overvægtig',
      price, quantity,
      total: overweightFee,
      position: -1,
      note: `Ordrens vægt: ${totalWeight} gr.\nKommunens nedre grænse: ${customer.municipality.weight_limit} gr.\nAntal påbegyndte ${customer.municipality.weight_limit} gram: ${quantity} x ${formatCurrency(price, false)}`,
    });
    overweightRate = {
      value: quantity,
      comment: null
    }
    isOverweight = true;
  }

  // handle credit limit
  const amount = total;
  if (orderInfo && orderInfo.payment_method !== 'Card' && amount > customer?.credit_limit) {
    errorOrder = errorOrder ? errorOrder : 'pbs_settings';
    if (throwError) {
      throw 'pbs_settings';
    }
  }
  const subtotal = Math.round(originTotalPrice * 100) / 100;
  const discount = Math.round((subtotal - total) * 100) / 100;

  return {
    product_list: products,
    subtotal,
    discount,
    total,
    delivery_fee: deliveryFee,
    total_weight: totalWeight,
    overweight_fee: overweightFee,
    overweight,
    is_overweight: isOverweight,
    overweight_rate: overweightRate,
    amount,
    error: errorOrder,
  };
}