import { HydratedDocument } from 'mongoose';
import { flattenParameters } from '../models/publicRoutes';

import {
  IdParameterInput,
  Parameter,
  Project as ProjectType,
} from '@arviva/core';
import cleanUpProject from './cleanUpProject';

const notEmpty = <TValue>(value: TValue): value is NonNullable<TValue> => {
  return value !== null && value !== undefined;
};

const extractParameterChanges = (project: HydratedDocument<ProjectType>) => {
  // const cleanedUpProject = cleanUpProject(project);
  const parameters = flattenParameters(project?.sectors || []);

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

  return parameterChanges;
};

export default extractParameterChanges;
