import { ParameterInput, Project } from '@arviva/core';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { authenticatedFetch } from '../../authentication/authenticatedFetch';

const getProjects = async (filter: any): Promise<Project[]> => {
  const response = await authenticatedFetch(
    `${import.meta.env.VITE_API_URL}/projects?${new URLSearchParams(
      filter,
    ).toString()}`,
  );
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const createProject = async ({
  values,
  type,
}: {
  values?: ParameterInput[];
  type?: string;
}) => {
  const response = await authenticatedFetch(
    `${import.meta.env.VITE_API_URL}/projects`,
    {
      method: 'POST',
      body: JSON.stringify({ values: values || [], type: type || '' }),
    },
  );
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const removeProject = async (projectId: string): Promise<Project> => {
  const response = await authenticatedFetch(
    `${import.meta.env.VITE_API_URL}/projects/${projectId}`,
    {
      method: 'DELETE',
    },
  );
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const duplicateProject = async (projectId: string): Promise<Project> => {
  const response = await authenticatedFetch(
    `${import.meta.env.VITE_API_URL}/projects/${projectId}/duplicate`,
    {
      method: 'POST',
    },
  );
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const useProjects = (filter?: any) => {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery(
    ['projects', JSON.stringify(filter)],
    () => getProjects(filter),
    {
      useErrorBoundary: true,
    },
  );

  const createProjectMutation = useMutation(
    ({ values, type }: { values?: ParameterInput[]; type: string }) =>
      createProject({ values, type }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      },
    },
  );

  const removeProjectMutation = useMutation(
    (projectId: string) => removeProject(projectId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      },
    },
  );

  const duplicateProjectMutation = useMutation(
    (projectId: string) => duplicateProject(projectId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      },
    },
  );

  return {
    projects: projectsQuery.data,
    error:
      projectsQuery.error ||
      createProjectMutation.error ||
      removeProjectMutation.error ||
      duplicateProjectMutation.error,
    loading:
      projectsQuery.isLoading ||
      createProjectMutation.isLoading ||
      removeProjectMutation.isLoading ||
      duplicateProjectMutation.isLoading,
    create: createProjectMutation.mutateAsync,
    remove: removeProjectMutation.mutateAsync,
    duplicate: duplicateProjectMutation.mutateAsync,
  };
};

export default useProjects;
