import { AuthProvider } from 'react-admin';
import httpClient from './httpClient';

const API_URL =
  import.meta.env.VITE_AUTH_API_URL ||
  'http://localhost:3000/api/authentication';

const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const request = new Request(`${API_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({ email: username, password }),
      credentials: 'include',
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    const response = await fetch(request);
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    const auth = await response.json();
    localStorage.setItem('auth', JSON.stringify(auth));
  },
  logout: () => {
    localStorage.removeItem('auth');
    return Promise.resolve();
  },
  checkAuth: () =>
    localStorage.getItem('auth') ? Promise.resolve() : Promise.reject(),
  checkError: (error) => {
    if (error.status === 401) {
      localStorage.removeItem('auth');
      return Promise.reject();
    }
    return Promise.resolve();
  },
  getIdentity: async () => {
    const { token } = JSON.parse(localStorage.getItem('auth') || 'null');

    const response = await httpClient(`${API_URL}/me`, {
      method: 'GET',
      credentials: 'include',
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.body);
    }

    return response.json;
  },
  getPermissions: () => Promise.resolve(''),
};

export default authProvider;
