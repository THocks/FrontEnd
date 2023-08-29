export type ActionMapType<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type AuthUserType = null | Record<string, any>;

export type AuthStateType = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUserType;
};

// ----------------------------------------------------------------------

export type JWTContextType = {
  method: string;
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUserType;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle?: () => void;
  loginWithGithub?: () => void;
  loginWithTwitter?: () => void;
};

export type FirebaseContextType = {
  method: string;
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUserType;
  login: (email: string, password: string) => void;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string
  ) => void;
  logout: () => void;
  loginWithGoogle?: () => void;
  loginWithGithub?: () => void;
  loginWithTwitter?: () => void;
  initialize?: () => void;
};

export type AWSCognitoContextType = {
  method: string;
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUserType;
  login: (email: string, password: string) => void;
  register: (email: string, password: string, firstName: string, lastName: string) => void;
  logout: () => void;
  loginWithGoogle?: () => void;
  loginWithGithub?: () => void;
  loginWithTwitter?: () => void;
};

export type Auth0ContextType = {
  method: string;
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUserType;
  // login: () => Promise<void>;
  logout: () => void;
  login: (email?: string, password?: string) => Promise<void>;
  register?: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;

};