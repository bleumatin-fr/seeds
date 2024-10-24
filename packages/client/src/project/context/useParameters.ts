import { Parameter } from '@arviva/core';
import { useQuery } from 'react-query';
import { authenticatedFetch } from '../../authentication/authenticatedFetch';

export const getParameters = async (
  parameters?: string[],
): Promise<Parameter[]> => {
  let url = `${process.env.REACT_APP_API_URL}/projects/parameters`;

  if (parameters) {
    url +=
      '?' +
      new URLSearchParams(
        parameters.map((parameter) => ['parameter', parameter]),
      );
  }

  const response = await authenticatedFetch(url, {
    method: 'GET',
  });

  return await response.json();
};

const useParameters = () => {
  const parametersQuery = useQuery('parameters', () => getParameters(), {
    useErrorBoundary: true,
  });

  return parametersQuery;
};

export default useParameters;
