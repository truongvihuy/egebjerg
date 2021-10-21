const CHARACTER_SPLIT = '-';
import { DEFAULT_SORT } from '../../../../packages/share/constant'
export function parseUrlParams(asPath) {
  const query = {
    q: undefined,
    is_coop_xtra: false,
    is_ecology: false,
    is_frozen: false,
    is_offer: false,
    is_favorite: false,
    is_most_bought: false,
    sort: DEFAULT_SORT,
    t: undefined,
  };

  let hasUrlParamsValue = false;
  (new URLSearchParams(asPath.split('?')[1])).forEach((value, key) => {
    if (key === 'filter') {
      let filter = value.split(CHARACTER_SPLIT);
      filter.forEach(e => {
        query[`is_${e}`] = true;
      });
      if (filter.length) {
        hasUrlParamsValue = true;
      }
    } else {
      query[key] = value;
      if (query[key]) {
        hasUrlParamsValue = true;
      }
    }
  });
  return { query, hasUrlParamsValue };
}

export function pushQueryToUrlParams(query) {
  const params = { filter: '' };

  Object.keys(query).forEach(key => {
    if (['is_coop_xtra', 'is_ecology', 'is_frozen', 'is_offer', 'is_favorite', 'is_most_bought'].includes(key) && query[key]) {
      params.filter = `${params.filter ? `${params.filter}${CHARACTER_SPLIT}` : ''}${key.slice(3)}`;
    } else if (key !== 'product_id') {
      if (key === 'q' && query[key]) {
        params[key] = query[key].replace(/ /g, '+');
      } else {
        params[key] = query[key];
      }
    }
  });

  return Object.keys(params).reduce((stringParams, key) => (
    params[key] ? `${stringParams}${stringParams ? '&' : ''}${key}=${params[key]}` : stringParams
  ), '');
}