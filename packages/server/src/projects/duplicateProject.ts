import { IdParameterInput, Parameter, ProjectUser } from '@arviva/core';
import Model from '../models/model';
import User from '../users/model';
import cleanUpProject from './cleanUpProject';
import createProject from './createProject';
import Project from './model';

import flattenParameters from './flattenParameters';

const notEmpty = <TValue>(value: TValue): value is NonNullable<TValue> => {
  return value !== null && value !== undefined;
};

const duplicateProject = async (
  projectId: string,
  newUserId: string,
  nameUpdater: (name: string) => string = (name) => `${name} (copie)`,
) => {
  const foundProject = cleanUpProject(
    await Project.findOne({
      _id: projectId,
    }).lean(),
  );
  if (!foundProject) {
    throw new Error('Project not found');
  }

  const foundModel = await Model.findById(foundProject.model._id);
  if (!foundModel) {
    throw new Error('Model not found');
  }

  const user = await User.findById(newUserId);

  if (!user) {
    throw new Error('User not found');
  }

  const users: ProjectUser[] = [
    {
      id: user._id,
      role: 'owner',
      user: user,
      lastSeenAt: new Date(),
    },
  ];

  const parameters = flattenParameters(foundProject.sectors);

  const parameterChanges = parameters
    .map((parameter: Parameter) => {
      if (!parameter.id) return null;
      return {
        type: 'id',
        id: parameter.id,
        value: parameter.value,
      };
    })
    .filter(notEmpty) as IdParameterInput[];

  const titleParameter = parameters.find(
    (parameter) =>
      parameter.id === foundModel.config.parameters.titleParameterId[0],
  );

  if (titleParameter && titleParameter.id) {
    parameterChanges.push({
      type: 'id',
      id: titleParameter.id,
      value: nameUpdater(titleParameter.value as string),
    });
  }
  let project = await createProject(
    { name: 'Mon Projet', users },
    foundModel,
    parameterChanges,
  );

  
  return await project.save();
};

export default duplicateProject;
