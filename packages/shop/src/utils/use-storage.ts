import { useState, useEffect } from 'react';
import localForage from 'localforage';
import { initializeApollo } from './apollo';
import { GET_PRODUCTS } from 'graphql/query/product.query';
const isObjectLiked = (value) =>
  value.constructor.name === 'Array' || value.constructor.name === 'Object';

const rehydrate = (value: any, defaultValue?: any) => {
  if (!value) return defaultValue;
  // if (value === 'false') str = false;
  // if (value === 'true') str = true;
  // if (!isObjectLiked(value)) {
  //   return value;
  // }
  try {
    const parse = JSON.parse(value);
    return parse;
  } catch (err) {
    return defaultValue;
  }
};

const hydrate = (value) => {
  if (!isObjectLiked(value)) {
    return value;
  }
  return JSON.stringify(value);
};
const createMigration = (opts, data) => {
  return new Promise((resolve, reject) => {
    const key = `${opts.key}-version`;
    localForage.getItem(key, (err, version) => {
      if (version !== opts.version) {
        data = opts.migrate(data);
        localForage.setItem(opts.key, rehydrate(data), (err) => {
          if (err) return reject(err);
          localForage.setItem(key, opts.version, (err) => {
            if (err) return reject(err);
            return resolve(data);
          });
        });
      } else {
        resolve(data);
      }
    });
  });
};

const config = {
  key: '@session',
  version: 1,
  migrate: (state) => {
    return { ...state };
  },
};

export const useStorage = (state, setState) => {
  const [rehydrated, setRehydrated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      await localForage.getItem(config.key, async (err, value) => {
        if (err) {
          setRehydrated(true);
          return setError(err);
        }
        // Migrate persisted data
        const restoredValue = rehydrate(value);
        if (restoredValue?.items.length) {
          const apolloClient = initializeApollo();
          const { data } = await apolloClient.query({
            query: GET_PRODUCTS,
            variables: {
              product_id: restoredValue.items.map(e => e._id),
              limit: restoredValue.items.length,
            },
          });
          restoredValue.items = restoredValue.items.map(item => ({
            ...item,
            ...data.products.items.find(e => e._id === item._id),
          }));
        }
        if (typeof config.migrate === 'function') {
          createMigration(config, restoredValue)
            .then((data) => setState(data))
            .then(() => setRehydrated(true));
        } else {
          setState(restoredValue);
          setRehydrated(true);
        }
      });
    }
    init();
  }, []);

  useEffect(() => {
    // if (isNil(state) || isEmpty(state)) {
    //   localForage.removeItem(config.key);
    // }
    let tmpState: { [key: string]: any } = {};
    tmpState.isOpen = state.isOpen;
    tmpState.items = state.items.map(e => ({ _id: e._id, quantity: e.quantity }));
    localForage.setItem(config.key, hydrate(tmpState));
  }, [state]);

  return {
    rehydrated,
    error,
  };
};
