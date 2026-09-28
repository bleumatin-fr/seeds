import { Parameter, Sector, Value } from '@arviva/core';

const flattenParameters = (sectors: Sector[]): Parameter[] =>
  sectors.reduce((allParameters, sector) => {
    const subParameters = flattenParameters(sector.sectors);

    return [...allParameters, ...sector.parameters, ...subParameters];
  }, [] as Parameter[]);

const isEmpty = (value: Value) => {
  if (Array.isArray(value) && value.length > 0) {
    return value[0] === '';
  }
  return value === '';
};

const isNotEmpty = (value: Value) => {
  if (Array.isArray(value) && value.length > 0) {
    return value[0] !== '';
  }
  return value !== '';
};

const initialValueFills = (value: Value) => {
  if (value === undefined || value === null) {
    return false;
  }
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  return isNotEmpty(value);
};

const valueNotEmpty = (parameter: Parameter) =>
  isNotEmpty(parameter.value) || initialValueFills(parameter.initialValue);

const valueEmpty = (parameter: Parameter) =>
  isEmpty(parameter.value) && !initialValueFills(parameter.initialValue);

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
