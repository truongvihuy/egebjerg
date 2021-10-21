import { GET_CATEGORIES } from 'graphql/query/category.query';
import React, { useContext, useEffect, useReducer } from 'react';
import { initializeApollo } from 'utils/apollo';
import { setLocalState, getLocalState } from 'utils/localStorage';
import { appReducer, initialState } from './app.reducer';
import { FirebaseContext } from 'contexts/firebase/firebase.context';

const AppContext = React.createContext({} as any);

export const AppProvider = ({ children }) => {
  const { firebaseDispatch } = useContext<any>(FirebaseContext);
  const [state, dispatch] = useReducer(appReducer, initialState);
  useEffect(() => {
    let firstTime = true;
    const syncCategory = async ({ newSnapshot }) => {
      let lastFirebaseState = localStorage.getItem('last_firebase_category');

      let categoryMap = null;
      if (firstTime || lastFirebaseState == newSnapshot) {
        categoryMap = getLocalState('category');
        firstTime = false;
      }

      if (!categoryMap) {
        const apolloClient = initializeApollo();
        const { data } = await apolloClient.query({
          fetchPolicy: 'network-only',
          query: GET_CATEGORIES,
          variables: {},
        });

        if (data && data.categories) {
          categoryMap = {
            0: { _id: 0, children_direct: [], parent_id: 0 },
          };
          data.categories.forEach(e => {
            let category = { ...e };
            delete category.__typename;
            categoryMap[category._id] = category;
            if (category.parent_id === null) {
              categoryMap[0].children_direct.push(category._id);
            }
          });
          categoryMap[0].children_direct.sort((a, b) => categoryMap[a].order - categoryMap[b].order);
        }
      }
      setLocalState('category', categoryMap);
      setLocalState('last_firebase_category', newSnapshot);
      dispatch({ type: 'SET_CATEGORY_MAP', payload: categoryMap });
    };
    firebaseDispatch({ type: 'REF_ON', payload: { route: `config`, callback: syncCategory } })

  }, []);

  return (
    <AppContext.Provider
      value={{
        appState: state,
        categoryMap: state.categoryMap,
        appDispatch: dispatch,
      }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext<any>(AppContext);
