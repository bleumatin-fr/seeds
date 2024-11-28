import { Model } from '@arviva/core';
import { useQuery } from 'react-query';
import { authenticatedFetch } from '../../authentication/authenticatedFetch';

const getModels = async (type?: string): Promise<Model[]> => {
  let url = `${import.meta.env.VITE_API_URL}/models`;
  if (type) {
    url += `?type=${encodeURIComponent(type)}`;
  }
  const response = await authenticatedFetch(url);
  return await response.json();
};
const useModels = () => {
  const modelsQuery = useQuery('models', () => getModels(), {
    useErrorBoundary: true,
  });
  return {
    models: modelsQuery.data,
    loading: modelsQuery.isLoading,
  };
};

export const useModelsOfType = (type: string) => {
  const modelsQuery = useQuery(['modelsType', type], () => getModels(type), {
    useErrorBoundary: true,
  });
  return {
    models: modelsQuery.data,
    loading: modelsQuery.isLoading,
  };
};

export default useModels;
