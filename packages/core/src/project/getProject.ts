import { getActions } from './getActions';
import { getCompletionRate } from './getCompletionRate';
import { getParameters } from './getParameters';
import { getResults } from './getResults';

import { Configuration, Project } from './types';

export const getProject = async (
  parameterRows: any[][],
  actionRows: any[][],
  resultRows: any[][],
  config: Configuration,
): Promise<Partial<Project>> => {
  const [parameters, results, actions] = await Promise.all([
    getParameters(parameterRows, config.parameters, () => true, true),
    getResults(resultRows, config.results),
    config.actions
      ? getActions(actionRows, config.actions)
      : Promise.resolve(undefined),
  ]);

  const { completionRate, uncompleted } = getCompletionRate(parameters);

  return {
    sectors: parameters,
    completionRate,
    uncompleted: uncompleted.map((parameter) => ({
      index: parameter.index,
      name: parameter.name,
      possibleValues: parameter.possibleValues,
    })),
    results,
    actions,
  };
};
