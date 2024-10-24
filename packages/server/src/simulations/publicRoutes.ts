import { ParameterInput, Project } from '@arviva/core';
import express from 'express';

import Model from '../models/model';

import { HttpError } from '../middlewares/errorHandler';

import cleanUpSimulation from './cleanUpSimulation';
import initSimulation from './initSimulation';
import updateParameters from './updateParameters';

const router = express.Router();

router.get('/:modelName', async (request, response) => {
  const model = await Model.findOne({ type: request.params.modelName, status: 'published' });
  if (!model) {
    throw new HttpError(404, 'Not found');
  }

  const simulation: Partial<Project> = await initSimulation(model);

  response.json(cleanUpSimulation(simulation));
});

const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const fixDateTypes = (parameterInputs: ParameterInput[]) =>
  parameterInputs.map((parameterInput) => {
    if (String(parameterInput.value) === parameterInput.value) {
      if (
        isoPattern.test(parameterInput.value) &&
        Date.parse(parameterInput.value) > 0
      ) {
        return {
          ...parameterInput,
          value: new Date(parameterInput.value),
        };
      }
    }
    return parameterInput;
  });

router.post('/:modelName', async (request, response) => {
  const {
    values,
    simulation,
  }: { values: ParameterInput[]; simulation: Partial<Project> } = request.body;

  const model = await Model.findOne({
    type: request.params.modelName,
    status: 'published',
  });
  if (!model) {
    throw new HttpError(404, 'Not found');
  }

  if (!simulation) {
    throw new HttpError(404, 'Not found');
  }

  const updatedSimulation = await updateParameters(
    { ...simulation, model },
    fixDateTypes(values),
  );

  response.json(cleanUpSimulation(updatedSimulation));
});

export default router;
