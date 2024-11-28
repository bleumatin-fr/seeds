const refreshToken = async () => {
  const request = new Request(
    `${import.meta.env.VITE_API_URL}/authentication/refresh`,
    {
      method: 'POST',
      credentials: 'include',
      headers: new Headers({ 'Content-Type': 'application/json' }),
    },
  );
  const response = await fetch(request);
  if (response.status < 200 || response.status >= 300) {
    throw new Error('Unauthorized');
  }
  const auth = await response.json();

  localStorage.setItem('auth', JSON.stringify(auth));
};

export const authenticatedFetch = async (
  input: RequestInfo | URL,
  options: RequestInit | undefined = {},
  iteration: number = 0,
): Promise<Response> => {
  if (!options.headers) {
    options.headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    });
  }

  const authItem = localStorage.getItem('auth');
  if (authItem) {
    try {
      const auth = JSON.parse(authItem);
      if (auth && auth.token) {
        (options.headers as any).set('Authorization', `Bearer ${auth.token}`);
      }
    } catch (e) {}
  }
  options.credentials = 'include';

  const response = await fetch(input, options);
  if (response.status === 401) {
    const { message } = await response.json();
    if (iteration === 0 && message === 'Token expired') {
      await refreshToken();
      return await authenticatedFetch(input, options, iteration + 1);
    }
    throw new Error('Unauthorized');
  }
  return response;
};
