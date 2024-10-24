import { Configuration, ModelStatus, spreadsheet } from '@arviva/core';
import express, { Request } from 'express';
import { FilterQuery } from 'mongoose';
import multer from 'multer';
import { HttpError } from '../middlewares/errorHandler';
import migrateProject from '../projects/migrateProject';
import Project from '../projects/model';
import { updateFileAndProject } from '../spreadsheets/adminRoutes';
import Model from './model';

const router = express.Router();
const upload = multer();

interface RequestQuery {
  type: string;
  _start: number;
  _end: number;
  _order: 'ASC' | 'DESC';
  _sort: string;
}

router.get('/', async (request, response) => {
  const { _end, _order, _sort, _start, type } =
    request.query as unknown as RequestQuery;

  let filter: FilterQuery<typeof Model> = {};

  if (type) {
    filter = { type };
  }

  const modelsCount = await Model.count(filter);

  const foundModels = await Model.find(filter)
    .sort({ [_sort]: _order === 'ASC' ? 1 : -1 })
    .skip(+_start)
    .limit(+_end - +_start)
    .lean();

  const modelsWithProjectCount = await Promise.all(
    foundModels.map(async (model) => {
      const projectsCount = await Project.count({ 'model._id': model._id });
      return { ...model, projectsCount };
    }),
  );

  response.setHeader('X-Total-Count', modelsCount);

  response.json(modelsWithProjectCount);
});

router.get('/:id', async (request, response) => {
  const foundModel = await Model.findById(request.params.id);
  if (!foundModel) {
    throw new HttpError(404, 'Not found');
  }
  response.json(foundModel);
});

router.post('/', upload.single('spreadsheet'), async (request, response) => {
  const { type, changelog, userInformation } = request.body;

  const existingModelType = await Model.find({ type })
    .sort({
      versionNumber: -1,
    })
    .limit(1);
  let versionNumber = 1;
  if (existingModelType && existingModelType.length) {
    versionNumber = existingModelType[0].versionNumber + 1;
  }

  if (
    !request.file ||
    request.file.mimetype !==
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    request.file.originalname.split('.').pop() !== 'xlsx'
  ) {
    throw new HttpError(400, 'Bad request');
  }

  if (!process.env.DOCBUILDER_SPREADSHEET_FOLDER) {
    throw new Error('DOCBUILDER_SPREADSHEET_FOLDER not set');
  }

  const publishedModel = await Model.findOne({
    type,
    status: ModelStatus.PUBLISHED,
  });
  let config: Configuration | null = null;
  if (publishedModel) {
    config = publishedModel.config;
  }

  const spreadsheetId = spreadsheet.getNewId();
  await updateFileAndProject(spreadsheetId, request.file.buffer);

  const newModel = new Model({
    name: publishedModel?.name || '',
    singularName: publishedModel?.singularName || '',
    type,
    description: publishedModel?.singularName || '',
    config,
    spreadsheetId,
    versionNumber,
    changelog,
    userInformation,
    status: 'draft',
  });

  response.json(await newModel.save());
});

router.post('/:id/publish', async (request, response) => {
  const foundModel = await Model.findById(request.params.id);
  if (!foundModel) {
    throw new HttpError(404, 'Not found');
  }

  await Model.updateMany(
    { type: foundModel.type, status: ModelStatus.PUBLISHED },
    { status: ModelStatus.ARCHIVED },
  );
  foundModel.status = ModelStatus.PUBLISHED;
  foundModel.publishedAt = new Date();
  await foundModel.save();

  const projectIds = await Project.find({
    'model.type': foundModel.type,
    $or: [
      { 'model.versionNumber': { $exists: false } },
      { 'model.versionNumber': { $lt: foundModel.versionNumber } },
    ],
  });

  migrateProject(projectIds.map((project) => project._id.toString()));

  response.json(foundModel);
});

router.put(
  '/:id',
  async (request: Request<{ id: string }, {}, { name: string }>, response) => {
    const newModel = await Model.findOneAndUpdate(
      { _id: request.params.id },
      request.body,
      {
        upsert: false,
        new: true,
      },
    );
    if (!newModel) {
      throw new HttpError(404, 'Not found');
    }
    response.json(newModel);
  },
);

router.delete('/:id', async (request, response) => {
  const foundModel = await Model.findById(request.params.id);
  if (!foundModel) {
    throw new HttpError(404, 'Not found');
  }
  await spreadsheet.remove(foundModel.spreadsheetId);
  await Model.deleteOne({ _id: request.params.id });

  response.json(foundModel);
});

export default router;
