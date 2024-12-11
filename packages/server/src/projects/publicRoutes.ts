import {
  Building,
  ModelStatus,
  ParameterInput,
  ProjectInformation,
  ProjectUser,
  Reference,
} from '@arviva/core';
import express, { Request } from 'express';
import jwt from 'jsonwebtoken';
import createProject from './createProject';
import updateParameters from './updateParameters';

import { authenticate } from '../authentication/authenticate';

import Model from '../models/model';
import User from '../users/model';
import Project from './model';

import { HttpError } from '../middlewares/errorHandler';
import { Role } from '../users/model';

import sendShareInviteAndSignup from './sendShareInviteAndSignup';
import sendShareInviteForUser from './sendShareInviteForUser';

import { IdParameterInput } from '@arviva/core';
import path from 'path';
import puppeteer from 'puppeteer';
import { send } from '../mail';
import cleanUpProject from './cleanUpProject';
import duplicateProject from './duplicateProject';
import flattenParameters from './flattenParameters';
import getData from './getData';
import { getStatisticsSpreadsheet } from './getStatistics';
import keyify from './keyify';

const router = express.Router();

interface RequestQuery {
  projectType: string;
  includePublic: boolean;
  limit?: number;
}

router.get(
  '/',
  async (request: Request<{}, {}, {}, RequestQuery>, response) => {
    let filters: any[] = [
      {
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: { $eq: null } }],
      },
    ];

    if (request.query.projectType) {
      filters.push({ 'model.type': request.query.projectType });
    }

    if (
      typeof request.query.includePublic !== 'undefined' &&
      request.query.includePublic
    ) {
      filters.push({
        $or: [
          { public: true },
          { users: { $elemMatch: { id: request.user._id } } },
        ],
      });
    } else {
      filters.push({ users: { $elemMatch: { id: request.user._id } } });
    }

    let query = Project.find({ $and: filters }).populate('users.user').sort({
      createdAt: -1,
    });

    const count = await query.clone().countDocuments();
    if (request.query.limit) {
      query = query.limit(request.query.limit);
    }

    const foundProjects = await query.lean();

    response.setHeader('X-Total-Count', count);

    response.json(foundProjects);
  },
);

router.post('/', async (request, response) => {
  const { values, type }: { values: ParameterInput[]; type: string } =
    request.body;

  const model = await Model.findOne({
    type: {
      $eq: type,
    },
    status: ModelStatus.PUBLISHED,
  });
  if (!model) {
    throw new HttpError(404, `Project model ${type} not found`);
  }

  const users: ProjectUser[] = [
    {
      id: request.user._id,
      role: 'owner',
      user: request.user,
      lastSeenAt: new Date(),
    },
  ];

  // const spreadsheetId = model.spreadsheetId.includes(':')
  //   ? model.spreadsheetId.split(':')[1]
  //   : model.spreadsheetId;
  const project = await createProject(
    { name: 'Mon Projet', users },
    model,
    values,
  );

  response.json(cleanUpProject(project.toObject()));
});

const notEmpty = <TValue>(value: TValue): value is NonNullable<TValue> => {
  return value !== null && value !== undefined;
};

router.post('/:id/duplicate', async (request, response) => {
  const foundProject = await Project.findOne({
    _id: request.params.id,
  })
    .populate('users.user')
    .lean();

  if (!foundProject) {
    throw new HttpError(404, 'Not found');
  }

  const hasAccess = foundProject.users?.some(
    (user: ProjectUser) => user.id.toString() === request.user._id.toString(),
  );
  if (!hasAccess && request.user.role !== Role.ADMIN) {
    throw new HttpError(403, 'Forbidden');
  }

  const newProject = await duplicateProject(
    request.params.id,
    request.user._id,
  );

  response.json(cleanUpProject(newProject.toObject()));
});

router.get('/:id', async (request, response) => {
  const foundProject = await Project.findOne(
    { _id: request.params.id },
    { 'model.spreadsheetId': 0, spreadsheetId: 0 },
  )
    .populate('users.user')
    .lean();
  if (!foundProject) {
    throw new HttpError(404, 'Not found');
  }

  if (request.headers.accept?.includes('application/vnd.ms-excel')) {
    const statSpreadSheetId = await getStatisticsSpreadsheet(
      [foundProject],
      true,
    );

    const spreadsheetId = statSpreadSheetId.includes(':')
      ? statSpreadSheetId.split(':')[1]
      : statSpreadSheetId;

    if (!process.env.DOCBUILDER_SPREADSHEET_FOLDER) {
      throw new Error('DOCBUILDER_SPREADSHEET_FOLDER not set');
    }
    return response.download(
      path.resolve(
        process.env.DOCBUILDER_SPREADSHEET_FOLDER,
        `${spreadsheetId}.xlsx`,
      ),
      `${keyify(foundProject.name)}.xlsx`,
    );
  }

  if (
    !foundProject.users.some(
      (user: ProjectUser) =>
        user.id && user.id.toString() === request.user._id.toString(),
    ) &&
    request.user.role !== Role.ADMIN
  ) {
    throw new HttpError(403, 'Forbidden');
  }

  response.json(cleanUpProject(foundProject));
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

router.patch('/share/update/:id', authenticate, async (request, response) => {
  const projectId: string = request.params.id;
  const { usersId } = request.body;
  const foundProject = await Project.findById(projectId);
  if (!foundProject) {
    throw new HttpError(404, 'Not found');
  }
  const usersData = await User.find({ _id: { $in: usersId } });
  const users = [
    ...foundProject.users.filter((user: ProjectUser) => user.role === 'owner'),
    ...usersData.map((user) => {
      return {
        id: user._id,
        role: 'user',
      };
    }),
  ];

  const savedProject = await Project.findOneAndUpdate(
    { _id: projectId },
    { users: users },
    { new: true },
  ).lean();

  response.json(cleanUpProject(savedProject));
});

interface SelectedProject {
  id?: string | null;
  year?: number | null;
  etp: number | null;
}

router.post('/:id/import', async (request, response) => {
  const projectId: string = request.params.id;
  const { projectsToImportFrom }: { projectsToImportFrom: SelectedProject[] } =
    request.body;
  let foundProject = await Project.findById(projectId);

  if (!foundProject) {
    throw new HttpError(404, 'Not found');
  }
  const parameters = flattenParameters(foundProject.sectors);
  const parameterChanges: IdParameterInput[] = [];

  const projects = await Project.find({
    _id: { $in: projectsToImportFrom.filter((p) => p.id).map((p) => p.id) },
  });

  parameters.forEach((parameter) => {
    if (!parameter.id) return;
    if (parameter.id.endsWith('_comment')) return;

    const toImportParameters = projectsToImportFrom
      .filter((p) => p.id)
      .map((project) => {
        const foundProject = projects.find(
          (p) => p._id.toString() === project.id,
        );
        if (!foundProject) {
          return null;
        }
        const parameters = flattenParameters(foundProject.sectors);
        const foundParameter = parameters.find((p) => p.id === parameter.id);
        if (!foundParameter) {
          return null;
        }
        const actualEtp = parameters.find((p) => p.id === 'Nb_employés');
        return {
          id: parameter.id,
          project: foundProject.name,
          actualEtp: (actualEtp?.value || 1) as number,
          etp: project.etp,
          value: foundParameter.exportedValue,
          unit: foundParameter.unit,
        };
      });
    const sum = toImportParameters.reduce((sum, parameter) => {
      if (!parameter || !parameter.value) {
        return sum;
      }
      if (typeof parameter.value !== 'number') {
        return sum;
      }

      return (
        (sum || 0) +
        parameter.value * ((parameter?.etp || 1) / (parameter.actualEtp || 1))
      );
    }, null as number | null);
    if (sum === null) {
      return;
    }

    const comment = toImportParameters.reduce((comment, parameter) => {
      if (!parameter) {
        return comment;
      }
      if (typeof parameter.value !== 'number') {
        return comment;
      }

      if (!comment)
        return `${parameter.value} ${parameter.unit} * (${parameter.etp} / ${parameter.actualEtp} ETP) (${parameter.project}) `;
      return `${comment} + ${parameter.value} ${parameter.unit} * (${parameter.etp} / ${parameter.actualEtp} ETP) (${parameter.project}) `;
    }, '');

    parameterChanges.push({
      type: 'id',
      id: parameter.id,
      value: sum,
    });
    parameterChanges.push({
      type: 'id',
      id: parameter.id + '_comment',
      value: comment,
    });
  });

  if (parameterChanges && parameterChanges.length !== 0) {
    foundProject = await updateParameters(foundProject, parameterChanges);
  }

  await foundProject.save();

  return response.json(cleanUpProject(foundProject.toObject()));
});

router.patch('/share/add/:id', authenticate, async (request, response) => {
  const projectId: string = request.params.id;
  const { email, message } = request.body;
  const foundProject = await Project.findById(projectId).lean();

  if (!foundProject) {
    throw new HttpError(404, 'Not found');
  }

  const foundUser = await User.findOne({
    email: {
      $eq: email,
    },
  }).lean();

  //check if email is associated to shared user
  if (
    foundUser &&
    foundProject.users
      .map((user: ProjectUser) => user.id.toString())
      .includes(foundUser._id.toString())
  ) {
    throw new HttpError(400, 'Utilisateur déjà ajouté');
  }

  const invitingUser = request.user;

  if (!foundUser) {
    if (!process.env.RESET_PASSWORD_TOKEN_SECRET) {
      throw new Error(
        'Environment variable RESET_PASSWORD_TOKEN_SECRET not set',
      );
    }
    if (!process.env.INVITATION_TOKEN_EXPIRY) {
      throw new Error('Environment variable INVITATION_TOKEN_EXPIRY not set');
    }
    const userToRegister = new User({
      email,
    });
    await userToRegister.save();
    const payload = {
      id: userToRegister._id,
    };
    const token = jwt.sign(payload, process.env.RESET_PASSWORD_TOKEN_SECRET);
    userToRegister.resetPasswordToken = token;
    await userToRegister.save();

    const savedProject = await Project.updateOne(
      { _id: projectId },
      {
        $push: {
          users: {
            id: userToRegister._id,
            role: 'user',
          },
        },
      },
    );

    await send({
      to: userToRegister.email,
      from: process.env.MAIL_FROM,
      ...sendShareInviteAndSignup({
        project: foundProject,
        invitedUser: userToRegister,
        invitingUser,
        message,
        token,
      }),
    });

    response.json(savedProject);
  }

  if (foundUser) {
    const savedProject = await Project.updateOne(
      { _id: projectId },
      {
        $push: {
          users: {
            id: foundUser._id,
            role: 'user',
          },
        },
      },
    );
    try {
      await send({
        to: email,
        from: process.env.MAIL_FROM,
        ...sendShareInviteForUser({
          project: foundProject,
          invitedUser: foundUser,
          invitingUser,
          message,
        }),
      });
      response.json(cleanUpProject(foundProject));
    } catch (error) {
      throw error;
    }
  }
});

router.patch('/:id', async (request, response) => {
  const {
    values,
    tour,
    references,
    lastSeenAt,
    buildings,
    projects,
  }: {
    values: ParameterInput[];
    tour: any;
    references: Reference[];
    lastSeenAt: Date;
    buildings: Building[];
    projects: ProjectInformation[];
  } = request.body;

  const projectId: string = request.params.id;
  let foundProject = await Project.findById(projectId);

  if (!foundProject) {
    throw new HttpError(404, 'Not found');
  }
  if (
    !foundProject.users.some((user: ProjectUser) =>
      user.id.equals(request.user._id),
    ) &&
    request.user.role !== Role.ADMIN
  ) {
    throw new HttpError(403, 'Forbidden');
  }

  let modifications = {} as any;

  if (tour) {
    modifications.tour = tour;
  }

  if (foundProject.spreadsheetId.includes(':')) {
    foundProject.spreadsheetId = foundProject.spreadsheetId.split(':')[1];
  }

  if (references) {
    modifications.references = [
      ...(foundProject.references || []).filter(
        (ref: any) =>
          references.findIndex((newRef) => newRef.index === ref.index) === -1,
      ),
      ...references,
    ];
  }

  if (buildings) {
    modifications.buildings = buildings;
  }

  if (projects) {
    modifications.projects = projects;
  }

  if (lastSeenAt) {
    const userConnected = request.user;
    const users: ProjectUser[] = [...foundProject.users];
    const userIndex = users.findIndex(
      (user) => user.id.toString() === userConnected._id.toString(),
    );

    if (userIndex !== -1) {
      users[userIndex].lastSeenAt = lastSeenAt;
      modifications.users = users;
    } else {
      console.error('User not found');
    }
  }
  if (Object.keys(modifications).length !== 0) {
    foundProject.set(modifications);
  }
  let updatedProject = await foundProject.save();

  if (values && values.length) {
    updatedProject = await updateParameters(
      updatedProject,
      fixDateTypes(values),
    );
  }

  const data = getData(updatedProject);
  if (data) {
    updatedProject.data = data;
    updatedProject = await updatedProject.save();
  }

  response.json(cleanUpProject(updatedProject.toObject()));
});

router.delete('/:id', async (request, response) => {
  const projectId = request.params.id;
  const foundProject = await Project.findById(projectId);
  if (!foundProject) {
    throw new HttpError(404, 'Not found');
  }
  if (
    !foundProject.users.some(
      (user: ProjectUser) =>
        user.id.equals(request.user._id) && user.role === 'owner',
    )
  ) {
    throw new HttpError(403, 'Forbidden');
  }

  foundProject.deletedAt = new Date();
  const savedProject = await foundProject.save();

  response.json(cleanUpProject(savedProject));
});

router.get('/:id/pdf-report', async (request, response) => {
  const authorizationHeader = request.headers.authorization;
  const projectId = request.params.id;
  const foundProject = await Project.findById(projectId);
  if (!foundProject) {
    throw new HttpError(404, 'Not found');
  }
  if (authorizationHeader) {
    const [_, token] = authorizationHeader.split(' ');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:4001';
    await page.goto(
      `${frontendUrl}/project/${foundProject._id.toString()}/results`,
      {
        waitUntil: 'networkidle0',
      },
    );
    await page.evaluate(`(() => {
      localStorage.setItem('auth', '{"success":true,"token":"${token}"}');
      localStorage.setItem('seeds-onboarding-collapsed', 'true');
      localStorage.setItem('seeds-onboarding-step', '3');
    })()`);
    await page.setCookie({
      name: 'CookieConsent',
      value: 'true',
      sameSite: 'Lax',
    });
    await page.goto(
      `${frontendUrl}/project/${foundProject._id.toString()}/pdf?hideFeedback=true`,
      {
        waitUntil: 'networkidle0',
      },
    );

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    response.type('application/pdf');
    response.send(pdf);
  }
});

export default router;
