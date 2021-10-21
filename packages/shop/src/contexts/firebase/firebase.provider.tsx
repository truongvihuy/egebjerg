import { useCreateContext } from '../create-context';
import { FirebaseReducer, initialState } from './firebase.reducer';
import { FirebaseContext } from './firebase.context';
import { useReducer } from 'react';

export const FirebaseProvider: React.FunctionComponent = ({ children }) => {
  const [firebaseState, firebaseDispatch] = useReducer(FirebaseReducer, initialState);

  return <FirebaseContext.Provider value={{ firebaseState, firebaseDispatch }}>
    {children}
  </FirebaseContext.Provider>
};