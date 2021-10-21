import { useMemo, useContext, useEffect, useState } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject,
  defaultDataIdFromObject,
  ApolloLink,
  from,
  fromPromise
} from '@apollo/client';
import { onError } from "@apollo/client/link/error";
import toast from 'react-hot-toast';
import { NETWORK_ERROR_MSG, GRAPHQL_ERROR_MSG, APOLLO_CODE_SKIP_LIST } from 'config/constant';
import { CustomerContext } from 'contexts/customer/customer.context';
import { getAccessToken, setAccessToken } from 'utils/access-token';
import { REFRESH_TOKEN } from 'graphql/query/customer.query';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

export const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    let messageToast = GRAPHQL_ERROR_MSG;
    graphQLErrors.forEach(({ message, locations, path, extensions: { code } }) => {
      if (code === 'UNAUTHENTICATED') {
        return fromPromise(
          fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              operationName: "refreshToken",
              query: REFRESH_TOKEN.loc.source.body,
            }),
            credentials: "include"
          }).then(res => res.json()).then((res) => {
            setAccessToken(res.data.refreshToken.accessToken);
            const oldHeaders = operation.getContext().headers;
            operation.setContext({
              headers: {
                ...oldHeaders,
                authorization: 'Bearer ' + getAccessToken(),
              },
            });
            //retry the request, returning the new observable
            return forward(operation);
          }).catch(error => {
            localStorage.clear();
            // Handle token refresh errors e.g clear stored tokens, redirect to login, ...
            return '';
          })
        )
      } else if (APOLLO_CODE_SKIP_LIST.includes(code)) {
        messageToast = null;
      } else if (code.match(/\@PUBLIC_/)) {
        messageToast = message;
      }
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,);
    });
    if (messageToast) {
      toast.error(messageToast);
    }
  } else if (networkError) {
    toast.error(NETWORK_ERROR_MSG);
    console.log(`[Network error]: ${networkError}`);
  }
});

export const authMiddleware = () => {
  return new ApolloLink((operation, forward) => {
    operation.setContext((context) => {
      const headers = context.headers ?? null;
      const token = typeof window !== "undefined" ? getAccessToken() : null;
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : (headers?.authorization ?? ''),
        }
      }
    });

    return forward(operation);
  });
}

export const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API_ENDPOINT, // Server URL (must be absolute)
  credentials: 'include', // Additional fetch() options like `credentials` or `headers`
});

export const createApolloClient = () => {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([errorLink, authMiddleware(), httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Reusable helper function to generate a field
            // policy for the Query.products field.
            products: {
              keyArgs: ['category_id', 'q', 'is_coop_xtra', 'is_ecology', 'is_frozen', 'is_offer', 'is_active', 'product_id', 'is_favorite', 'is_most_bought', 'sort', 't'],
              merge(existing, incoming) {
                const { items: newItems } = incoming;
                return existing
                  ? {
                    ...incoming,
                    items: [...existing.items, ...newItems],
                  }
                  : incoming;
              },
            },
          },
        },
      },
      dataIdFromObject(responseObject) {
        switch (responseObject.__typename) {
          case 'Suggest':
          case 'OrderProduct':
            return undefined;
          default:
            return defaultDataIdFromObject(responseObject);
        }
      }
    }),
  });
}

export const initializeApollo = (initialState: any = null) => {
  const _apolloClient = apolloClient ?? createApolloClient();
  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();
    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') {
    return _apolloClient;
  }
  // Create the Apollo Client once in the client
  if (!apolloClient) {
    apolloClient = _apolloClient;
  }

  return _apolloClient;
}

export function useApollo(initialState = null) {
  const { customerState } = useContext<any>(CustomerContext);

  const store = useMemo(() => initializeApollo(initialState), [initialState]);

  return store;
}
