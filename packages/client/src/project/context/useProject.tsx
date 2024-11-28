import {
  Building,
  Parameter,
  ParameterInput,
  Project,
  ProjectInformation,
  Reference,
  Sector,
  Value,
} from '@arviva/core';
import { debounce } from 'lodash';
import { Types } from 'mongoose';
import { useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { authenticatedFetch } from '../../authentication/authenticatedFetch';
import { Tour } from '../../tour/context/types';
import { getValue } from '../parameters/getValue';

const optimisticUpdate = (
  sectors: Sector[],
  newValues: ParameterInput[],
): Sector[] => {
  return sectors.map((sector) => {
    return {
      ...sector,
      sectors: optimisticUpdate(sector.sectors, newValues),
      parameters: sector.parameters.map((parameter) => {
        const newValue = newValues.find((newValue) => {
          if (newValue.type === 'index') {
            return newValue.index === parameter.index;
          }
          if (newValue.type === 'id') {
            return newValue.id === parameter.id;
          }
          return false;
        });
        if (newValue) {
          return {
            ...parameter,
            value: newValue.value,
          };
        }
        return parameter;
      }),
    };
  });
};

const mergeValues = (values: ParameterInput[]) => {
  return values.reduce<ParameterInput[]>((merged, value) => {
    const found = merged.find((v) => {
      if (v.type === 'index' && value.type === 'index') {
        return v.index === value.index;
      }
      if (v.type === 'id' && value.type === 'id') {
        return v.id === value.id;
      }
      return false;
    });
    if (found) {
      return [
        ...merged.filter((v) => {
          if (v.type === 'index' && value.type === 'index') {
            return v.index !== value.index;
          }
          if (v.type === 'id' && value.type === 'id') {
            return v.id !== value.id;
          }
          return true;
        }),
        value,
      ];
    }
    return [...merged, value];
  }, [] as ParameterInput[]);
};

const shareProject = async ({
  email,
  message,
  projectId,
}: {
  email: string;
  message?: string;
  projectId: string;
}) => {
  const response = await authenticatedFetch(
    `${import.meta.env.VITE_API_URL}/projects/share/add/${projectId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ email, message: message || '' }),
    },
  );
  if (response.status < 200 || response.status >= 300) {
    throw await response.json();
  }
  return await response.json();
};

const updateSharedUsers = async ({
  usersId,
  projectId,
}: {
  usersId: Types.ObjectId[];
  projectId: string;
}) => {
  const response = await authenticatedFetch(
    `${import.meta.env.VITE_API_URL}/projects/share/update/${projectId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ usersId }),
    },
  );
  if (response.status < 200 || response.status >= 300) {
    throw await response.json();
  }
  return await response.json();
};

const getProject = async (projectId: string): Promise<Project> => {
  const response = await authenticatedFetch(
    `${import.meta.env.VITE_API_URL}/projects/${projectId}`,
  );
  return await response.json();
};

const patchProject = async (id: string, body: BodyInit | null | undefined) => {
  const response = await authenticatedFetch(
    `${import.meta.env.VITE_API_URL}/projects/${id}`,
    {
      method: 'PATCH',
      body,
    },
  );
  return await response.json();
};

export const useProject = (projectId: string | undefined) => {
  if (!projectId) {
    throw new Error('No projectId');
  }
  const valuesBuffer = useRef([] as ParameterInput[]);
  const queryClient = useQueryClient();
  const ongoingMutations = useRef(0);

  const projectQuery = useQuery(
    ['project', projectId],
    () => getProject(projectId),
    {
      useErrorBoundary: true,
    },
  );

  const updateReferencesMutation = useMutation(
    (references: Reference[]) =>
      patchProject(projectId, JSON.stringify({ references })),
    {
      onMutate: async (newReferences: Reference[]) => {
        ongoingMutations.current += 1;
        await queryClient.cancelQueries({ queryKey: ['project', projectId] });

        const previousProject = queryClient.getQueryData<Project>([
          'project',
          projectId,
        ]);

        const newProject = {
          ...previousProject,
          references: newReferences,
        };
        queryClient.setQueryData(['project', projectId], newProject);
      },
      onSettled: (updatedProject) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(['project', projectId], updatedProject);

        queryClient.invalidateQueries('projects');
      },
    },
  );

  const updateParametersMutation = useMutation(
    (values: ParameterInput[]) =>
      patchProject(
        projectId,
        JSON.stringify({
          values,
        }),
      ),
    {
      onMutate: async (newValues: ParameterInput[]) => {
        ongoingMutations.current += 1;
        await queryClient.cancelQueries({ queryKey: ['project', projectId] });

        const previousProject = queryClient.getQueryData<Project>([
          'project',
          projectId,
        ]);

        const newProject = {
          ...previousProject,
          sectors: optimisticUpdate(previousProject?.sectors || [], newValues),
        };
        queryClient.setQueryData(['project', projectId], newProject);
      },
      onSettled: (updatedProject) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(['project', projectId], updatedProject);
        queryClient.invalidateQueries('projects');
      },
    },
  );

  const updateBuildingsMutation = useMutation(
    (buildings: Building[]) =>
      patchProject(projectId, JSON.stringify({ buildings })),
    {
      onMutate: async (newBuildings: Building[]) => {
        ongoingMutations.current += 1;
        await queryClient.cancelQueries({ queryKey: ['project', projectId] });

        const previousProject = queryClient.getQueryData<Project>([
          'project',
          projectId,
        ]);

        const newProject = {
          ...previousProject,
          buildings: newBuildings,
        };
        queryClient.setQueryData(['project', projectId], newProject);
      },
      onSettled: (updatedProject) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(['project', projectId], updatedProject);
        queryClient.invalidateQueries('projects');
      },
    },
  );

  const updateProjectsMutation = useMutation(
    (projects: ProjectInformation[]) =>
      patchProject(projectId, JSON.stringify({ projects })),
    {
      onMutate: async (newProjects: ProjectInformation[]) => {
        ongoingMutations.current += 1;
        await queryClient.cancelQueries({ queryKey: ['project', projectId] });

        const previousProject = queryClient.getQueryData<Project>([
          'project',
          projectId,
        ]);

        const newProject = {
          ...previousProject,
          projects: newProjects,
        };
        queryClient.setQueryData(['project', projectId], newProject);
      },
      onSettled: (updatedProject) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(['project', projectId], updatedProject);
        queryClient.invalidateQueries('projects');
      },
    },
  );

  const updateLastSeenAtMutation = useMutation(
    () =>
      patchProject(
        projectId,
        JSON.stringify({
          lastSeenAt: new Date(),
        }),
      ),
    {
      onMutate: async () => {
        ongoingMutations.current += 1;
        await queryClient.cancelQueries({ queryKey: ['project', projectId] });

        const previousProject = queryClient.getQueryData<Project>([
          'project',
          projectId,
        ]);

        const newProject = {
          ...previousProject,
          lastSeenAt: new Date(),
        };
        queryClient.setQueryData(['project', projectId], newProject);
      },
      onSettled: (updatedProject) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(['project', projectId], updatedProject);
        queryClient.invalidateQueries('projects');
      },
    },
  );

  const shareProjectMutation = useMutation(
    ({ email, message }: { email: string; message?: string }) =>
      shareProject({ email, message, projectId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', projectId]);
      },
      onSettled: (updatedProject) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(['project', projectId], updatedProject);
      },
    },
  );

  const updateSharedUsersMutation = useMutation(
    ({ usersId }: { usersId: Types.ObjectId[] }) =>
      updateSharedUsers({ usersId, projectId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', projectId]);
      },
      onSettled: (updatedProject) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(['project', projectId], updatedProject);
      },
    },
  );

  const updateTourMutation = useMutation(
    (tour: Tour) =>
      patchProject(
        projectId,
        JSON.stringify({
          tour,
        }),
      ),
    {
      onMutate: async (newTour: Tour) => {
        ongoingMutations.current += 1;
        await queryClient.cancelQueries({ queryKey: ['project', projectId] });

        const previousProject = queryClient.getQueryData<Project>([
          'project',
          projectId,
        ]);

        const newProject = {
          ...previousProject,
          tour: newTour,
        };
        queryClient.setQueryData(['project', projectId], newProject);
      },
      onSettled: (updatedProject) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(['project', projectId], updatedProject);
      },
    },
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPatchProject = useCallback(
    debounce(
      (id: string) => {
        const mergedValues = mergeValues(valuesBuffer.current);
        valuesBuffer.current = [];
        updateParametersMutation.mutate(mergedValues);
      },
      500,
      { maxWait: 3000, trailing: true },
    ),
    [],
  );

  const updateParameter = (index: number | string, value: Value) => {
    if (typeof index === 'number') {
      valuesBuffer.current.push({ type: 'index', index, value });
    } else {
      valuesBuffer.current.push({ type: 'id', id: index, value });
    }
    debouncedPatchProject(projectId);
  };

  return {
    project: projectQuery.data,
    loading:
      projectQuery.isFetching ||
      updateParametersMutation.isLoading ||
      updateTourMutation.isLoading ||
      updateSharedUsersMutation.isLoading ||
      updateLastSeenAtMutation.isLoading ||
      shareProjectMutation.isLoading,
    error: shareProjectMutation.error || updateSharedUsersMutation.error,
    updateParameter,
    updateLastSeenAt: updateLastSeenAtMutation.mutateAsync,
    updateParameterAsync: updateParametersMutation.mutateAsync,
    updateBuildings: updateBuildingsMutation.mutateAsync,
    updateProjects: updateProjectsMutation.mutateAsync,
    updateTour: updateTourMutation.mutateAsync,
    updateReferences: updateReferencesMutation.mutateAsync,
    updateSharedUsers: updateSharedUsersMutation.mutateAsync,
    shareProject: shareProjectMutation.mutateAsync,
  };
};

const projectTitlesParameterNames = [
  'Nom du projet',
  'Nom du bâtiment',
  'Nom de la structure *',
];
const defaultTitles = ['projet', 'bâtiment', 'fonctionnement'];

export const flattenParameters = (sectors: Sector[]): Parameter[] =>
  sectors.reduce((allParameters, sector) => {
    const subParameters = flattenParameters(sector.sectors || []);

    return [...allParameters, ...sector.parameters, ...subParameters];
  }, [] as Parameter[]);

export const getProjectTitle = (sectors?: Sector[]): string | undefined => {
  let title: string | undefined = undefined;

  const titleParameter = flattenParameters(sectors || []).find(
    (parameter) =>
      parameter.name && projectTitlesParameterNames.includes(parameter.name),
  );

  if (titleParameter) {
    const defaultTitle =
      defaultTitles[
        projectTitlesParameterNames.indexOf(titleParameter?.name || '')
      ];
    title = getValue<string>(titleParameter.value) || defaultTitle;
  }

  return title;
};
