import { createContext, useEffect, useReducer, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import {
  getAuth,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/types/collection/collection';
import firebase from './db/Firebase';


import { ActionMapType, AuthStateType, AuthUserType, FirebaseContextType } from '@/types/firebase/types';

// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
}

type Payload = {
  [Types.INITIAL]: {
    isAuthenticated: boolean;
    user: AuthUserType;
  };
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext<FirebaseContextType | null>(null);

// ----------------------------------------------------------------------

const firebaseApp = firebase
const DB = getFirestore(firebaseApp);

export const storage = getStorage(firebaseApp);
export const AUTH = getAuth(firebaseApp);
export const getDB = DB;

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(() => {
    try {
      onAuthStateChanged(AUTH, async (user) => {
        if (user) {
          const userRef = doc(DB, 'users', user.uid);

          const docSnap = await getDoc(userRef);

          const profile = docSnap.data();

          dispatch({
            type: Types.INITIAL,
            payload: {
              isAuthenticated: true,
              user: {
                ...user,
                ...profile,
              },
            },
          });
        } else {
          dispatch({
            type: Types.INITIAL,
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(
    (email: string, password: string): Promise<UserCredential> =>
      signInWithEmailAndPassword(AUTH, email, password),
    []
  );


  // REGISTER
  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      phoneNumber: string
    ) => {
      await createUserWithEmailAndPassword(AUTH, email, password).then(
        async (res: UserCredential) => {
          const userRef = doc(collection(DB, COLLECTIONS.USERS), res.user?.uid);
          await setDoc(userRef, {
            uid: res.user?.uid,
            email,
            phoneNumber,
            firstName,
            lastName,
            createdAt: new Date().toISOString(),
          });
          initialize();
        }
      );
    },
    [initialize]
  );

  // LOGOUT
  const logout = useCallback(() => {
    signOut(AUTH);
  }, []);

  const memoizedValue = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      method: 'firebase',
      login,
      register,
      logout,
      initialize,
    }),
    [
      state.isAuthenticated,
      state.isInitialized,
      state.user,
      login,
      register,
      logout,
      initialize,
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}