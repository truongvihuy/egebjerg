import {
  CURRENCY, DEFAULT_DATE_FORMAT, LOCALE, FREE_NAME_PRODUCT_ID, WEIGHT,
  NUMBER_ROW_PER_PAGE, LIMIT_EXP_THUMBOR,
} from 'app/constants';
import { format } from 'date-fns-tz';
import axios from 'app/axios';
import config from 'config/config';
import jwtDecode from 'jwt-decode';
import { cloneDeep } from 'lodash';
import { startOfDay } from 'date-fns';

export const parseUrlParams = (asPath: string) => {
  const query = {};
  (new URLSearchParams(asPath.split('?')[1])).forEach((value, key) => {
    query[key] = value;
  });

  return query;
}

export const processFilterToParams = (filter: any, defaultParams: any = {}) => {
  if (filter) {
    let params = { ...defaultParams };

    for (let i = 0; i < filter.filters.length; i++) {
      let x = filter.filters[i];
      if (x.field == '_id') {
        params = {
          ...defaultParams,
          _id: x.value
        };
        break;
      }
      params[x.field] = x.value;
    }
    return params;
  }

  return defaultParams;
}

export const changeUrlParamByDataState = (history, moduleName, dataState: any, filterTypeList = {}, defaultParams: any = {}) => {
  let urlParams = '';

  let params: any = {
    ...defaultParams,
  };

  if (dataState.take) {
    params.limit = dataState.take;
  }

  if (dataState.skip) {
    params.page = 1 + dataState.skip / dataState.take;
  }

  if (dataState.filter) {
    for (let i = 0; i < dataState.filter.filters.length; i++) {
      let eleFilter = dataState.filter.filters[i];
      if (eleFilter.field == '_id') {
        params = {
          _id: eleFilter.value
        };
        break;
      }
      if ('date' === filterTypeList?.[eleFilter.field]) {
        params[eleFilter.field] = format(eleFilter.value, 'dd-MM-yyyy');
      } else {
        params[eleFilter.field] = eleFilter.value;
      }
    }
  }

  let first = true;
  for (const key in params) {
    urlParams += `${first ? '?' : '&'}${key}=${encodeURIComponent(params[key])}`;
    first = false;
  }

  history.push({
    pathname: '/' + moduleName,
    search: urlParams,
  });
}

export const processDataStateToUrlParams = (dataState: any, defaultParams: any = {}, returnParams = false) => {
  let params = { ...defaultParams };
  if (dataState.filter) {
    for (let i = 0; i < dataState.filter.filters.length; i++) {
      let x = dataState.filter.filters[i];
      if (x.field == '_id') {
        params = {
          ...defaultParams,
          _id: x.value
        };
        break;
      }
      params[x.field] = x.value;
    }
  }
  if (dataState.skip > 0 && dataState.take) {
    params.page = dataState.skip / dataState.take + 1;
  }

  if (dataState.take) {
    params.limit = dataState.take;
  }

  if (returnParams) {
    return params;
  }

  let urlParams = '';
  let first = true;
  for (const key in params) {
    urlParams += `${first ? '?' : '&'}${key}=${encodeURIComponent(params[key])}`;
    first = false;
  }
  return urlParams;
}

export const convertUnixTime = (time, pattern = DEFAULT_DATE_FORMAT, timeZone = 'Europe/Copenhagen') => {
  let date;
  switch (typeof time) {
    case 'object': {
      date = time;
      break;
    }
    case 'number': {
      date = new Date(time * 1000);
      break;
    }
    case 'string': {
      date = new Date(time);
      break;
    }
    default: date = new Date();
  }

  return format(date, pattern, { timeZone: timeZone });
}

export const formatCurrency = (number, displayCurrency = true) => {
  let intlCurrency = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2, style: 'currency', currency: CURRENCY, currencyDisplay: 'code' });
  //Must use NumberFormat to get char `,` but cannot move DKK to left side so must remove it
  return `${displayCurrency ? CURRENCY + ' ' : ''}${intlCurrency.format(number).replace(/[a-z]{3}/i, "").trim()}`;
}

export const formatWeight = (number, options = { maximumFractionDigits: 2 }) => {
  let intlCurrency = new Intl.NumberFormat(LOCALE, options);
  return `${intlCurrency.format(number)}${WEIGHT}`;
}

export const formatNumber = (number, options = { maximumFractionDigits: 2 }) => {
  let intlCurrency = new Intl.NumberFormat(LOCALE, options);
  return `${intlCurrency.format(number)}`;
}

export const isFreeNameProduct = (id) => id === FREE_NAME_PRODUCT_ID;

export const getPagingConfig = (type) => {
  let perPage: any = localStorage.getItem('paging');
  try {
    perPage = JSON.parse(perPage);
    return perPage?.[type] ?? NUMBER_ROW_PER_PAGE;
  } catch (e) {
    localStorage.removeItem('paging');
    return NUMBER_ROW_PER_PAGE;
  }
}

export const setPagingConfig = async (type, value) => {
  let perPage: any = localStorage.getItem('paging');
  try {
    perPage = JSON.parse(perPage) ?? {};
  } catch (e) {
    perPage = {};
  }
  perPage[type] = value;
  await axios.put('/users/setting', { paging: perPage })
  localStorage.setItem('paging', JSON.stringify(perPage));
}

const getNow = () => {
  return Math.round(+ new Date() / 1000);
}

const checkTimeToken = (bearerToken) => {
  let token = bearerToken.replace('Bearer ', '');
  let tokenDecoded = jwtDecode(token);
  let now = getNow();
  if (tokenDecoded.exp) {
    return (tokenDecoded.exp - now) > LIMIT_EXP_THUMBOR;
  }
  return true;
}
const thumborServerApiUrl = config.THUMBOR_SERVER_URL + '/api';
export const uploadImageGetUUID = async (formData, processError) => {
  let checkTime = checkTimeToken(axios.defaults.headers.common.Authorization);
  if (!checkTime) {
    //get new token
    await axios.get('/auth/access_token');
  }
  return await axios
    .post(thumborServerApiUrl, formData)
    .then(response => {
      return response.data.image_location.replace('/', '');
    }).catch(e => {
      console.log(e);
      processError();
      return null;
    });;
};

export const handleGoBack = (history, route = '/dashboard') => {
  if (history.length > 2) {
    history.goBack();
  } else {
    history.push(route);
  }
}

export const initDataState = (query, filterTypeList, moduleName = null) => {
  let dataState: any = {
    skip: 0,
    filter: {
      filters: [],
      logic: 'and',
    },
  };
  if (moduleName) {
    dataState.take = +(query.limit ?? getPagingConfig(moduleName));
    if (query.page && +query.page > 0) {
      dataState.skip = (+query.page - 1) * dataState.take;
    }
  }
  Object.keys(query).forEach(key => {
    if (filterTypeList[key]) {
      switch (filterTypeList[key]) {
        case 'number':
          dataState.filter.filters.push({
            field: key,
            operator: 'eq',
            value: +query[key],
          });
          break;
        case 'text':
          dataState.filter.filters.push({
            field: key,
            operator: 'contains',
            value: query[key],
          });
          break;
        case 'boolean':
          let tmpValue = query[key] === 'true' ? true : query[key] === 'false' ? false : null;
          if (typeof tmpValue === 'boolean') {
            dataState.filter.filters.push({
              field: key,
              operator: 'eq',
              value: tmpValue,
            });
          }
          break;
        case 'date':
          const [day, month, year] = query[key].split('-');
          if (+day && +month && +year) {
            dataState.filter.filters.push({
              field: key,
              operator: 'eq',
              value: startOfDay(new Date(`${year}-${month}-${day}`)),
            });
          }
          break;
        default:
          break;
      }
    }
  });

  return dataState;
}

export const processDataStateFromUrlQuery = (query, dataState) => {
  let newDataState = cloneDeep(dataState);
  Object.keys(query).forEach(key => {
    let itemIndex = dataState.filter?.filters.findIndex(e => e.field === key);
    if (newDataState?.filter?.filters[itemIndex]?.value) {
      newDataState.filter.filters[itemIndex].value = query[key];
    }
  });

  return newDataState;
}


export const handleDataStateChange = (preDataState, nextDataState, typePaging = null) => {
  if (typePaging && preDataState.take !== nextDataState.take) {
    setPagingConfig(typePaging, nextDataState.take);
  }

  const preFieldId = preDataState.filter?.filters.find(e => e.field === '_id');
  const nextFieldId = nextDataState.filter?.filters.find(e => e.field === '_id');

  if (nextFieldId && nextFieldId?.value !== preFieldId?.value) {
    nextDataState.filter.filters = [nextFieldId];
  } else {
    if (nextFieldId) {
      nextDataState.filter.filters = nextDataState.filter.filters.filter(e => e.field !== '_id');
    }
  }

  return nextDataState;
}

export const NumberDataState = (key, value, dataState) => {
  dataState.filter.filters.push({
    field: key,
    operator: 'eq',
    value: +value,
  });
};

export const TextDataState = (key, value, dataState) => {
  dataState.filter.filters.push({
    field: key,
    operator: 'contains',
    value: value,
  });
};

export const ActiveDataState = (key, value, dataState) => {
  let tmpValue = value === 'true' ? true : value === 'false' ? false : null;
  if (typeof tmpValue === 'boolean') {
    dataState.filter.filters.push({
      field: key,
      operator: 'eq',
      value: tmpValue,
    });
  }
};

export const DateDataState = (key, value, dataState) => {
  const [operator, filterValue] = value.split(':');
  if (['isnull', 'isnotnull'].includes(operator)) {
    dataState.filter.filters.push({
      field: key,
      operator,
      value: null,
    });
  } else {
    if (filterValue) {
      dataState.filter.filters.push({
        field: key,
        operator,
        value: new Date(filterValue),
      });
    }
  }
}