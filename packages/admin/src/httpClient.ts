import { fetchUtils, HttpError } from 'react-admin';

const AUTH_API_URL =
  import.meta.env.VITE_AUTH_API_URL ||
  'http://localhost:3000/api/authentication';

const refreshToken = async () => {
  const response = await fetchUtils.fetchJson(`${AUTH_API_URL}/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error('Unauthorized');
  }
  localStorage.setItem('auth', response.body);
};

type httpClientReturnType = Promise<
  | {
      status: number;
      headers: Headers;
      body: string;
      json: any;
    }
  | Blob
>;

async function httpClient(
  url: string,
  options?: fetchUtils.Options,
  transformMethod?: 'json',
  iteration?: number,
): Promise<{
  status: number;
  headers: Headers;
  body: string;
  json: any;
}>;
async function httpClient(
  url: string,
  options?: fetchUtils.Options,
  transformMethod?: 'blob',
  iteration?: number,
): Promise<Blob>;
async function httpClient(
  url: string,
  options: fetchUtils.Options = {},
  transformMethod: 'json' | 'blob' = 'json',
  iteration: number = 0,
): httpClientReturnType {
  if (!options.headers) {
    options.headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    });
  }
  const auth = localStorage.getItem('auth');
  if (auth) {
    const { token } = JSON.parse(localStorage.getItem('auth') || 'null');
    (options.headers as any).set('Authorization', `Bearer ${token}`);
  }
  options.credentials = 'include';
  try {
    switch (transformMethod) {
      case 'json':
        return await fetchUtils.fetchJson(url, options);
      case 'blob':
        const response = await fetch(url, options);
        return await response.blob();
      default:
        return await fetchUtils.fetchJson(url, options);
    }
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      if (error.status === 401 && error.body.message === 'Token expired') {
        await refreshToken();
        if (transformMethod === 'blob') {
          return await httpClient(url, options, transformMethod, iteration + 1);
        }
        return await httpClient(url, options, transformMethod, iteration + 1);
      }
    }
    return Promise.reject(error);
  }
}

export default httpClient;
