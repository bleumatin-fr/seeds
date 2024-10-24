import {
  getParameters,
  getResults,
  Model as ModelType,
  Parameter,
  Result,
  spreadsheet,
} from '@arviva/core';
import xlsx from 'xlsx';
import { flattenParameters } from '../models/publicRoutes';

interface ModelsConfig {
  [key: string]: {
    parametersConfig: string[];
    parameters: string[];
    resultsConfig: string[];
  };
}

const getConfigErrors = async (
  model: ModelType,
  buffer: ArrayBufferLike,
): Promise<string[]> => {
  const { parameterRows, resultRows } = await spreadsheet.read(buffer, {
    parameterRows: model.config.parameters.range,
    resultRows: model.config.results.range,
  });

  const workbook = xlsx.read(buffer, { sheetStubs: true });

  const parameters = flattenParameters(
    await getParameters(
      parameterRows,
      model.config!.parameters,
      () => true,
      true,
    ),
  );

  if (!parameters || !parameters.length) {
    return ['No parameters in file'];
  }

  const results = await getResults(resultRows, model.config.results);

  const configErrors: string[] = [];
  if (
    model.config.parameters.titleParameterId &&
    model.config.parameters.titleParameterId.length &&
    !parameters.find(
      (param) =>
        param.id && model.config.parameters.titleParameterId.includes(param.id),
    )
  ) {
    configErrors.push(
      `Title parameter not found. It should have one following id: "${model.config.parameters.titleParameterId.join(
        '", "',
      )}"`,
    );
  }

  // const invalidNamedRanges =
  //   workbook?.Workbook?.Names?.filter((namedRange) =>
  //     namedRange.Ref.startsWith('#'),
  //   ) || [];

  // configErrors.concat(
  //   ...invalidNamedRanges.map(
  //     (namedRange) =>
  //       `Named range "${namedRange.Name}" is not valid and point to nowhere.`,
  //   ),
  // );

  return configErrors;
};

const getModelConfigErrors = (
  model: ModelType,
  parameters: Parameter[],
  results: Result[],
): string[] => {
  return [];
};

const isParamInProject = (parameterId: string, parameters: Parameter[]) => {
  return parameters.find((parameter) => parameter.id === parameterId);
};

const isResultInProject = (resultCode: string, results: Result[]) => {
  return results.find(
    (result) => 'code' in result && result.code === resultCode,
  );
};

export default getConfigErrors;
