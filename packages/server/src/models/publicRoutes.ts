import {
  getParameters,
  Model as ModelType,
  ModelStatus,
  Parameter,
  Sector,
  spreadsheet,
} from '@arviva/core';
import express from 'express';

import { FilterQuery } from 'mongoose';
import Model from './model';

const router = express.Router();

export const flattenParameters = (sectors: Sector[]): Parameter[] =>
  sectors.reduce((allParameters, sector) => {
    const subParameters = flattenParameters(sector.sectors);

    return [...allParameters, ...sector.parameters, ...subParameters];
  }, [] as Parameter[]);

router.get('/', async (request, response) => {
  const { type } = request.query;

  let query: FilterQuery<typeof Model> = {};
  if (type) {
    query = { type: { $eq: type } };
  } else {
    query = {
      status: ModelStatus.PUBLISHED,
    };
  }
  const models = await Model.find(query).lean();
  const cleanedUpModels = await Promise.all(
    models.map(async (model: ModelType) => {
      try {
        const spreadsheetId = model.spreadsheetId.includes(':')
          ? model.spreadsheetId.split(':')[1]
          : model.spreadsheetId;

        const { rows } = await spreadsheet.read(`${spreadsheetId}_optimized`, {
          rows: model.config!.parameters.range,
        });

        const parameters = await getParameters(
          rows,
          model.config!.parameters,
          (parameter: Parameter) => {
            return parameter.displayOnCreate ? true : false;
          },
        );
        model.parameters = flattenParameters(parameters);
      } catch (err) {}

      const { spreadsheetId: _, config, ...cleanedModel } = model;
      const {
        parameters: { externalModules },
      } = config;

      return {
        ...cleanedModel,
        config: { parameters: { externalModules } },
      };
    }),
  );
  response.json(cleanedUpModels);
});

export default router;
