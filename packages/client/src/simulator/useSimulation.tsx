import { ParameterInput, Project, Sector, Value } from '@arviva/core';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { authenticatedFetch } from '../authentication/authenticatedFetch';

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

const getSimulation = async (modelName: string): Promise<Project> => {
  const response = await authenticatedFetch(
    `${process.env.REACT_APP_API_URL}/simulations/${modelName}`,
  );
  return await response.json();
};

const postSimulation = async (
  modelName: string,
  body: BodyInit | null | undefined,
) => {
  const response = await authenticatedFetch(
    `${process.env.REACT_APP_API_URL}/simulations/${modelName}`,
    {
      method: 'POST',
      body,
    },
  );
  return await response.json();
};

export const useSimulation = (modelName: string | undefined) => {
  const [simulation, setSimulation] = useState<Partial<Project> | undefined>(
    undefined,
  );
  const valuesBuffer = useRef([] as ParameterInput[]);
  const ongoingMutations = useRef(0);

  useEffect(() => {
    if (modelName && !simulation) {
      getSimulation(modelName).then(setSimulation);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateParametersMutation = useMutation(
    (values: ParameterInput[]) =>
      postSimulation(
        modelName || '',
        JSON.stringify({
          simulation,
          values,
        }),
      ),
    {
      onMutate: async (newValues: ParameterInput[]) => {
        ongoingMutations.current += 1;
        setSimulation({
          ...simulation,
          sectors: optimisticUpdate(simulation?.sectors || [], newValues),
        });
      },
      onSettled: (updatedProject) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 && setSimulation(updatedProject);
      },
    },
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPatchSimulation = useCallback(
    debounce(
      () => {
        const mergedValues = mergeValues(valuesBuffer.current);
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
    debouncedPatchSimulation();
  };

  return {
    simulation,
    loading: updateParametersMutation.isLoading,
    updateParameter,
    updateParameterAsync: updateParametersMutation.mutateAsync,
  };
};
