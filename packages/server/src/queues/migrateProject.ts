import {
  getParameters,
  Model as ModelType,
  Parameter,
  ParametersConfiguration,
  Project as ProjectType,
} from '@arviva/core';
import { Job, ProcessCallbackFunction } from 'bull';
import * as dotenv from 'dotenv-flow';
import { HydratedDocument } from 'mongoose';
import connect from '../db';
import Model from '../models/model';
import extractParameterChanges from '../projects/extractParameterChanges';
import Project from '../projects/model';
import refreshProject from '../projects/refreshProject';
import spreadsheet from '../spreadsheets/spreadsheet';
import updateParameters from '../projects/updateParameters';
import fs from 'fs';
import path from 'path';
import flattenParameters from '../projects/flattenParameters';

const notEmpty = <TValue>(value: TValue): value is NonNullable<TValue> => {
  return value !== null && value !== undefined;
};

const readParameters = async (
  spreadsheetId: string,
  config: ParametersConfiguration,
): Promise<Parameter[]> => {
  if (!process.env.DOCBUILDER_SPREADSHEET_FOLDER) {
    throw new Error('DOCBUILDER_SPREADSHEET_FOLDER not set');
  }
  const filePath = path.resolve(process.env.DOCBUILDER_SPREADSHEET_FOLDER);

  const technicalSpreadsheetId = spreadsheetId.includes(':')
    ? spreadsheetId.split(':')[1]
    : spreadsheetId;

  const fileName = fs.existsSync(
    path.join(filePath, `${technicalSpreadsheetId}.xlsx`),
  )
    ? technicalSpreadsheetId
    : `${technicalSpreadsheetId}_optimized`;

  const { parameters: parametersRows } = await spreadsheet.read(fileName, {
    parameters: config.range,
  });

  const parameters = await getParameters(
    parametersRows,
    config,
    () => true,
    true,
  );

  return flattenParameters(parameters.filter(notEmpty));
};

const getNewlyAddedParameters = async (
  oldProject: ProjectType,
  newModel: ModelType,
) => {
  const oldParameters = await readParameters(
    oldProject.spreadsheetId,
    oldProject.model.config.parameters,
  );
  const newParameters = await readParameters(
    newModel.spreadsheetId,
    newModel.config.parameters,
  );

  const newlyAddedParameters = newParameters.filter((parameter) => {
    const oldParameter = oldParameters.find(
      (oldParameter) => oldParameter.id === parameter.id,
    );

    return !oldParameter;
  });

  return newlyAddedParameters;
};

export interface MigrateProjectJob {
  projectId: string;
  modelId?: string;
}

export const migrateProject = async ({
  projectId,
  modelId,
}: MigrateProjectJob) => {
  dotenv.config({
    silent: true,
  });
  await connect(process.env.MONGO_URL);

  const foundProject = await Project.findById(projectId);

  if (!foundProject) {
    throw new Error(`Project with id ${projectId} not found`);
  }

  let newModel: HydratedDocument<ModelType> | null;

  if (modelId) {
    newModel = await Model.findOne({
      _id: modelId,
      type: foundProject.model.type,
    });
  } else {
    newModel = await Model.findOne({
      status: 'published',
      type: foundProject.model.type,
    });
  }

  if (!newModel) {
    throw new Error('Model not found');
  }

  const parameters = extractParameterChanges(foundProject).filter(
    ({ value }) => {
      if (Array.isArray(value)) {
        return (
          value.length > 0 &&
          value.some((v) => v !== null && v !== undefined && v !== '')
        );
      }
      return value !== null && value !== undefined && value !== '';
    },
  );

  await spreadsheet.remove(foundProject.spreadsheetId);
  const newSpreadsheetId = await spreadsheet.copy(
    `${newModel!.spreadsheetId}_optimized`,
  );

  await Project.updateOne(
    { _id: projectId },
    { model: newModel, spreadsheetId: newSpreadsheetId },
  );

  let updatedProject = await Project.findById(projectId);

  if (!updatedProject) {
    throw new Error(`Project with id ${projectId} not found`);
  }

  await updateParameters(updatedProject, parameters);

  updatedProject = await Project.findById(projectId);
  if (!updatedProject) {
    throw new Error(`Project with id ${projectId} not found`);
  }

  await refreshProject(updatedProject);

  updatedProject = await Project.findById(projectId);
  if (!updatedProject) {
    throw new Error(`Project with id ${projectId} not found`);
  }

  let newParameters: Parameter[] = [];
  try {
    newParameters = await getNewlyAddedParameters(foundProject, newModel);
  } catch (e) {
    // do nothing it might fail with old models
  }

  updatedProject.new = newParameters;

  await updatedProject.save();

  return updatedProject;
};

const migrateProjectJob: ProcessCallbackFunction<MigrateProjectJob> = async (
  job: Job<MigrateProjectJob>,
) => {
  const { projectId, modelId } = job.data;

  await migrateProject({ projectId, modelId });
};

export default migrateProjectJob;
