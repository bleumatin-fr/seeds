import { createContext, ReactNode, useContext } from 'react';
import { useMutation } from 'react-query';
import { useLocalStorage } from 'usehooks-ts';
import { authenticatedFetch } from '../authenticatedFetch';

interface Auth {
  success: boolean;
  token?: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  optin?: boolean;
}

interface AuthenticationContextType {
  auth: Auth | null;
  error: unknown;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  recover: (email: string) => Promise<void>;
  sendMessage: (object: string, message: string, url: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthenticationContext = createContext<AuthenticationContextType>({
  auth: null,
  error: null,
  loading: false,
  login: (email: string, password: string) => Promise.resolve(),
  recover: (email: string) => Promise.resolve(),
  sendMessage: (object: string, message: string, url: string) =>
    Promise.resolve(),
  resetPassword: (token: string, password: string) => Promise.resolve(),
  register: (params: RegisterParams) => Promise.resolve(),
  logout: () => Promise.resolve(),
});

AuthenticationContext.displayName = 'AuthenticationContext';

const login = async (email: string, password: string) => {
  const request = new Request(
    `${process.env.REACT_APP_API_URL}/authentication/login`,
    {
      method: 'POST',
      credentials: 'include',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ email, password }),
    },
  );
  const response = await fetch(request);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const register = async (params: RegisterParams) => {
  const request = new Request(
    `${process.env.REACT_APP_API_URL}/authentication/register`,
    {
      method: 'POST',
      credentials: 'include',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(params),
    },
  );
  const response = await fetch(request);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const recover = async (email: String) => {
  const request = new Request(
    `${process.env.REACT_APP_API_URL}/authentication/recover`,
    {
      method: 'POST',
      credentials: 'include',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ email }),
    },
  );
  const response = await fetch(request);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const resetPassword = async (token: String, password: string) => {
  const request = new Request(
    `${process.env.REACT_APP_API_URL}/authentication/reset-password`,
    {
      method: 'POST',
      credentials: 'include',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ token, password }),
    },
  );
  const response = await fetch(request);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const sendMessage = async (object: string, message: string, url: string) => {
  const request = new Request(
    `${process.env.REACT_APP_API_URL}/authentication/send-message`,
    {
      method: 'POST',
      credentials: 'include',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ object, message, url }),
    },
  );
  const response = await authenticatedFetch(request);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

export const AuthenticationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [auth, setAuth] = useLocalStorage<Auth | null>('auth', null);

  const loginMutation = useMutation(
    ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    {
      onSuccess: (auth) => {
        setAuth(auth);
      },
    },
  );

  const recoverMutation = useMutation(({ email }: { email: string }) =>
    recover(email),
  );

  const resetPasswordMutation = useMutation(
    ({ token, password }: { token: string; password: string }) =>
      resetPassword(token, password),
  );

  const registerMutation = useMutation(
    (params: RegisterParams) => register(params),
    {
      onSuccess: (auth) => {
        setAuth(auth);
      },
    },
  );

  const sendMessageMutation = useMutation(
    ({
      object,
      message,
      url,
    }: {
      object: string;
      message: string;
      url: string;
    }) => sendMessage(object, message, url),
  );

  const logout = async () => {
    localStorage.removeItem('auth');
    setAuth(null);
    return Promise.resolve();
  };

  const authenticationValues = {
    auth,
    error:
      loginMutation.error ||
      registerMutation.error ||
      recoverMutation.error ||
      resetPasswordMutation.error ||
      sendMessageMutation.error,
    loading:
      loginMutation.isLoading ||
      registerMutation.isLoading ||
      recoverMutation.isLoading ||
      resetPasswordMutation.isLoading ||
      sendMessageMutation.isLoading,
    login: (email: string, password: string) =>
      loginMutation.mutateAsync({ email, password }),
    recover: (email: string) => recoverMutation.mutateAsync({ email }),
    sendMessage: (object: string, message: string, url: string) =>
      sendMessageMutation.mutateAsync({ object, message, url }),
    resetPassword: async (token: string, password: string) => {
      const { user } = await resetPasswordMutation.mutateAsync({
        token,
        password,
      });
      if (!user) {
        throw new Error('User not found');
      }
      return await loginMutation.mutateAsync({ email: user.email, password });
    },
    register: (params: RegisterParams) => registerMutation.mutateAsync(params),
    logout,
  };

  return (
    <AuthenticationContext.Provider value={authenticationValues}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthentication = () => {
  return useContext(AuthenticationContext);
};
