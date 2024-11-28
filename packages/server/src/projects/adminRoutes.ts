import express, { Request } from 'express';
import { SortOrder } from 'mongoose';
import path from 'path';
import { HttpError } from '../middlewares/errorHandler';
import Model from '../models/model';
import { migrateProject } from '../queues/migrateProject';
import duplicateProject from './duplicateProject';
import { getStatisticsSpreadsheet } from './getStatistics';
import Project from './model';

const router = express.Router();

interface RequestQuery {
  _start: number;
  _end: number;
  _order: 'ASC' | 'DESC';
  _sort: string;
  users: string[];
  q: string;
  public: boolean | undefined;
  deleted: boolean | undefined;
}

router.get(
  '/',
  async (request: Request<{}, {}, {}, RequestQuery>, response) => {
    const {
      _end,
      _order,
      _sort,
      _start,
      users,
      q,
      public: isPublic,
      deleted: isDeleted = false,
    } = request.query;

    let filter: any = {
      // 'model.type': 'building',
    };

    if (users && users.length > 0) {
      filter = { ...filter, users: { $elemMatch: { id: users } } };
    }

    if (q) {
      filter = { ...filter, name: { $regex: q, $options: 'i' } };
    }

    if (isDeleted) {
      filter = { ...filter, deletedAt: { $ne: null } };
    } else {
      filter = {
        ...filter,
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: { $eq: null } }],
      };
    }

    if (typeof isPublic !== 'undefined') {
      if (isPublic) {
        filter = { ...filter, public: true };
      } else {
        filter = {
          ...filter,
          $or: [{ public: false }, { public: { $exists: false } }],
        };
      }
    }

    let sort: { [key: string]: SortOrder } = {
      [_sort]: _order === 'ASC' ? 1 : -1,
      name: _sort === 'name' ? (_order === 'ASC' ? 1 : -1) : 1,
    };

    const projectsCount = await Project.count(filter);

    const foundProjects = await Project.find(filter)
      .sort(sort)
      .skip(_start)
      .limit(_end - _start);

    response.setHeader('X-Total-Count', projectsCount);

    response.json(foundProjects);
  },
);

router.get('/statistics', async (request, response) => {
  const foundProjects = await Project.find({
    $or: [{ deletedAt: { $exists: false } }, { deletedAt: { $eq: null } }],
  })
    .populate('users.user')
    .sort({ createdAt: -1 });
  if (!foundProjects.length) {
    throw new HttpError(404, 'No project found');
  }
  const statSpreadSheetId = await getStatisticsSpreadsheet(foundProjects);

  const spreadsheetId = statSpreadSheetId.includes(':')
    ? statSpreadSheetId.split(':')[1]
    : statSpreadSheetId;

  if (!process.env.DOCBUILDER_SPREADSHEET_FOLDER) {
    throw new Error('DOCBUILDER_SPREADSHEET_FOLDER not set');
  }
  return response.sendFile(
    path.resolve(
      process.env.DOCBUILDER_SPREADSHEET_FOLDER,
      `${spreadsheetId}.xlsx`,
    ),
  );
});

router.get('/:id', async (request, response) => {
  const foundProject = await Project.findOne({
    $or: [{ _id: request.params.id }, { spreadsheetId: request.params.id }],
  });
  if (!foundProject) {
    throw new HttpError(404, 'Not found');
  }
  response.json(foundProject);
});

router.put(
  '/:id',
  async (
    request: Request<
      { id: string },
      {},
      {
        users: [
          {
            id: string;
            role: string;
          },
        ];
      }
    >,
    response,
  ) => {
    const { users } = request.body;
    const newProject = await Project.findOneAndUpdate(
      { _id: request.params.id },
      { users },
      {
        upsert: false,
        new: true,
      },
    );
    if (!newProject) {
      throw new HttpError(404, 'Not found');
    }
    response.json(newProject);
  },
);

router.delete('/:id', async (request, response) => {
  const foundProject = await Project.findById(request.params.id);
  if (!foundProject) {
    throw new HttpError(404, 'Not found');
  }

  foundProject.deletedAt = new Date();
  await foundProject.save();

  response.json(foundProject);
});

router.post('/:id/migrate', async (request, response) => {
  const foundProject = await Project.findById(request.params.id);
  if (!foundProject) {
    throw new HttpError(404, 'Not found');
  }

  const newModel = await Model.findById(request.body.modelId);
  if (!newModel) {
    throw new HttpError(404, 'Model not found');
  }

  const newProject = await duplicateProject(
    foundProject._id.toString(),
    request.user._id,
    (name) =>
      `${name} (migration ${foundProject.model.versionNumber} => ${newModel.versionNumber})`,
  );

  const migratedProject = await migrateProject({
    projectId: newProject._id.toString(),
    modelId: newModel._id.toString(),
  });

  response.status(200).send(migratedProject?.toObject());
});

export default router;
