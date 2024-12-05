import {
  Action,
  getActions,
  getCompletionRate,
  getParameters,
  getResults,
  Model,
  Parameter,
  Project as ProjectType,
  Result,
  Sector,
} from '@arviva/core';
import { HydratedDocument } from 'mongoose';
import spreadsheet from '../spreadsheets/spreadsheet';
import getProjectTitle from '../projects/getProjectTitle';

export const refreshParameters = async (
  model: Model,
  data: any[][],
): Promise<{
  sectors: Sector[];
  completionRate: number;
  uncompleted: Parameter[];
  name: string;
}> => {
  const sectors = await getParameters(
    data,
    model.config.parameters,
    () => true,
    true,
  );
  const { completionRate, uncompleted } = getCompletionRate(sectors);

  const name = getProjectTitle({ model: model, sectors }, '') || '';

  return {
    sectors,
    completionRate,
    uncompleted,
    name,
  };
};

export const refreshResults = async (
  model: Model,
  data: any[][],
): Promise<{
  results: Result[];
} | null> => {
  if(!model.config?.results) {
    return null;
  }
  return {
    results: await getResults(data, model.config.results),
  };
};

export const refreshActions = async (
  model: Model,
  data: any[][],
): Promise<{
  actions: Action[];
} | null> => {
  if (!model.config?.actions) {
    return null;
  }
  return {
    actions: await getActions(data, model.config.actions),
  };
};

export const initSimulation = async (
  model: Model,
): Promise<Partial<ProjectType>> => {
  if (!model.config) {
    throw new Error('Model does not have a config');
  }
  if(!model.spreadsheetId) {
    throw new Error('Model does not have a spreadsheetId');
  }

  const { parameters, actions, results } = await spreadsheet.read(
    `${model.spreadsheetId}_optimized`,
    {
      parameters: model.config.parameters.range,
      actions: model.config.actions?.range,
      results: model.config.results.range,
    },
  );

  return {
    model,
    spreadsheetId: model.spreadsheetId,
    ...(await refreshParameters(model, parameters)),
    ...(await refreshResults(model, results)),
    ...(await refreshActions(model, actions)),
  };
};

export default initSimulation;
