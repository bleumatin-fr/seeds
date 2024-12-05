import {
  Model,
  ParameterInput,
  Project as ProjectType,
} from '@arviva/core';
import { HydratedDocument } from 'mongoose';
import Project from './model';
import { refreshProject } from './refreshProject';
import updateParameters from './updateParameters';
import spreadsheet from '../spreadsheets/spreadsheet';

export const createProject = async (
  project: Partial<ProjectType>,
  model: HydratedDocument<Model>,
  initParameters?: ParameterInput[],
): Promise<HydratedDocument<ProjectType>> => {
  const spreadsheetId = await spreadsheet.copy(
    `${model.spreadsheetId}_optimized`,
  );

  let savedProject = await Project.create({
    name: 'TEST',
    ...project,
    spreadsheetId,
    model,
  });

  if (initParameters) {
    savedProject = await updateParameters(savedProject, initParameters);
  }

  savedProject = await refreshProject(savedProject);
  
  return await savedProject.save();
};

export default createProject;
