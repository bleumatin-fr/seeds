import { Parameter, Sector } from '@arviva/core';

const flattenParameters = (sectors: Sector[]): Parameter[] =>
  sectors.reduce((allParameters, sector) => {
    const subParameters = flattenParameters(sector.sectors);

    return [...allParameters, ...sector.parameters, ...subParameters];
  }, [] as Parameter[]);

const valueNotEmpty = (parameter: Parameter) => {
  if (Array.isArray(parameter.value) && parameter.value.length > 0) {
    return parameter.value[0] !== '';
  }
  return parameter.value !== '';
};
const valueEmpty = (parameter: Parameter) => {
  if (Array.isArray(parameter.value) && parameter.value.length > 0) {
    return parameter.value[0] === '';
  }
  return parameter.value === '';
};

const valueNotZero = (parameter: Parameter) => {
  return parameter.value !== 0;
};

const fillableParameters = (parameter: Parameter) => {
  return !['explanation', 'import_project'].includes(parameter.type || '');
};

const displayedParameters = (parameter: Parameter) => {
  return parameter.display;
}

export const getCompletionRate = (
  sectors: Sector[],
): { completionRate: number; uncompleted: Parameter[] } => {
  if (sectors.length === 0) {
    return { completionRate: 100, uncompleted: [] };
  }
  const parameters = flattenParameters(sectors)
    .filter(fillableParameters)
    .filter(displayedParameters)
    .filter(valueNotZero);
  const total = parameters;
  const completed = parameters.filter(valueNotEmpty);
  const uncompleted = parameters.filter(valueEmpty);

  return {
    completionRate: Math.round((completed.length / (total.length || 1)) * 100),
    uncompleted,
  };
};