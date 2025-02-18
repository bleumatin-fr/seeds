import express from 'express';
import fsSync from 'fs';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import path from 'path';
import xlsx from 'xlsx';
import { HttpError } from '../middlewares/errorHandler';
import Model from '../models/model';
import Project from '../projects/model';
import { UserType } from '../users/model';

import { ModelStatus } from '@arviva/core';
import multer from 'multer';
import sanitizeFilename from 'sanitize-filename';
import refreshProject from '../projects/refreshProject';
import getConfigErrors from './getConfigErrors';
import getFunctionErrors from './getFunctionErrors';

const upload = multer();

const router = express.Router();

enum DocumentStatus {
  UserJoined = 1,
  Save = 2,
  ErrorOnSave = 3,
  UserLeft = 4,
  ForceSave = 6,
  ErrorOnForceSave = 7,
}

router.get('/', async (req, res) => {
  if (!process.env.DOCBUILDER_SPREADSHEET_FOLDER) {
    throw new Error('DOCBUILDER_SPREADSHEET_FOLDER not set');
  }
  const filePath = path.resolve(process.env.DOCBUILDER_SPREADSHEET_FOLDER);

  const files = await fs.readdir(filePath);

  res.set('X-Total-Count', files.length.toString());
  res.json(
    files.map((file) => ({
      id: path.parse(file).name,
    })),
  );
});

const getEditorConfig = (
  key: string,
  spreadsheetId: string,
  user: UserType,
) => ({
  document: {
    key,
    url: `${process.env.DOCUMENTSERVER_API_URL}/spreadsheets/${spreadsheetId}`,
    permissions: {
      review: false,
      print: false,
      comment: false,
      chat: false,
    },
  },
  documentType: 'cell',
  editorConfig: {
    user: {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      group: user.role,
    },
    callbackUrl: `${process.env.DOCUMENTSERVER_API_URL}/spreadsheets/${spreadsheetId}/track`,
    customization: {
      anonymous: {
        request: false,
      },
      autosave: true,
      forcesave: true,
      compactHeader: true,
      toolbarNoTabs: true,
      info: false,
      toolbarHideFileName: true,
      uiTheme: 'theme-light',
      comments: false,
    },
  },
  height: '100%',
  width: '100%',
});

export const getAccessToken = (payload: any) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Environment variable JWT_SECRET not set');
  }

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET);
  return accessToken;
};

const getNewId = (): string =>
  new Date().getTime().toString(36) + Math.random().toString(36).slice(2);

router.get('/:spreadsheetId', async (request, response) => {
  const sanitizedSpreadsheetId = sanitizeFilename(request.params.spreadsheetId);

  const spreadsheetId = sanitizedSpreadsheetId.includes(':')
    ? sanitizedSpreadsheetId.split(':')[1]
    : sanitizedSpreadsheetId;

  if (request.header('Accept') === 'application/json') {
    const foundProject = await Project.findOne({ spreadsheetId });
    const foundModel = await Model.findOne({ spreadsheetId });

    const title = foundProject?.name
      ? `Spreadsheet of ${foundProject.name} project `
      : foundModel?.name
      ? `Spreadsheet of ${foundModel.name} model`
      : `Untitled`;

    let options: any = { title };

    const key = getNewId();
    const config = getEditorConfig(key, spreadsheetId, request.user);
    options = {
      ...options,
      type: 'local',
      config,
      token: getAccessToken(config),
    };

    response.json({
      id: spreadsheetId,
      ...options,
    });
    return;
  }

  if (!process.env.DOCBUILDER_SPREADSHEET_FOLDER) {
    throw new Error('DOCBUILDER_SPREADSHEET_FOLDER not set');
  }

  const originalFilePath = path.resolve(
    process.env.DOCBUILDER_SPREADSHEET_FOLDER,
    `${spreadsheetId}_original.xlsx`,
  );

  if (!fsSync.existsSync(originalFilePath)) {
    return response.sendFile(
      path.resolve(
        process.env.DOCBUILDER_SPREADSHEET_FOLDER,
        `${spreadsheetId}.xlsx`,
      ),
    );
  }

  return response.sendFile(originalFilePath);
});

router.post(
  '/:spreadsheetId',
  upload.single('file'),
  async (request, response) => {
    const spreadsheetId = request.params.spreadsheetId;

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

    const model = await Model.findOne({
      type: spreadsheetId,
      status: ModelStatus.PUBLISHED,
    });
    if (!model) {
      console.error('Model not found');
      throw new HttpError(404, 'Model not found');
    }

    try {
      const configurationError = await getConfigErrors(
        model,
        request.file.buffer,
      );

      if (configurationError.length > 0) {
        response.status(500).json({ configErrors: configurationError });
        return;
      }

      const functionErrors = await getFunctionErrors(request.file.buffer);
      if (!Boolean(request.body?.testOnly)) {
        await updateFileAndProject(spreadsheetId, request.file.buffer);
      }
      // TODO : actually check for errors
      response.status(200).send({ spreadsheetId, functionErrors });
    } catch (e) {
      console.error(e);
      throw new HttpError(400, 'Bad request');
    }
  },
);

const replaceNamedRanges = (
  worksheet: xlsx.WorkSheet,
  cell: string,
  ranges: xlsx.DefinedName[],
) => {
  ranges?.forEach((namedRange) => {
    const namedRangeName = namedRange.Name;
    const namedRangeRef = namedRange.Ref;
    if (worksheet[cell].f?.includes(namedRangeName)) {
      let safeNamedRangeRef = namedRangeRef.replaceAll('$', '$$$$');
      if (/^\[[0-9]+\]/.test(safeNamedRangeRef)) {
        safeNamedRangeRef = safeNamedRangeRef.replace(/^\[[0-9]+\]/, '');
      }
      worksheet[cell].f = worksheet[cell].f.replace(
        new RegExp(`([^a-zA-Z0-9_]|^)${namedRangeName}([^a-zA-Z0-9_]|$)`, 'g'),
        `$1${safeNamedRangeRef}$2`,
      );
    }
  });
};

const removeComments = (worksheet: xlsx.WorkSheet, cell: string) => {
  if (worksheet[cell].c) {
    delete worksheet[cell].c;
  }
};

const searchWithAsteriskRegex = /SEARCH\("(.*\*.*)",/;

const removeAsteriskFromSearch = (worksheet: xlsx.WorkSheet, cell: string) => {
  if (worksheet[cell].f) {
    const matches = worksheet[cell].f.match(searchWithAsteriskRegex);
    if (matches && matches.length > 1) {
      worksheet[cell].f = worksheet[cell].f.replace(
        searchWithAsteriskRegex,
        `SEARCH("${matches[1].replaceAll('*', '')}",`,
      );
    }
  }
};

const optimizeAndWriteFile = async (
  filePath: string,
  file: ArrayBufferLike,
) => {
  const workbook = xlsx.read(file, { sheetStubs: true });
  const sheetNames = workbook.SheetNames;
  const namedRanges =
    workbook?.Workbook?.Names?.filter(
      (namedRange) => !namedRange.Name.startsWith('_'),
    )
      ?.filter(({ Sheet }) => typeof Sheet === 'undefined')
      .sort((a, b) => b.Name.length - a.Name.length) || [];

  sheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const cells = Object.keys(worksheet);

    cells.forEach((cell) => {
      replaceNamedRanges(worksheet, cell, namedRanges);
      removeComments(worksheet, cell);
      removeAsteriskFromSearch(worksheet, cell);
    });
  });

  if (workbook.Workbook) {
    workbook.Workbook.Names = [];
  }

  xlsx.writeFile(workbook, filePath);
};

export const updateFileAndProject = async (
  spreadsheetId: string,
  file: ArrayBufferLike,
) => {
  if (!process.env.DOCBUILDER_SPREADSHEET_FOLDER) {
    throw new Error('DOCBUILDER_SPREADSHEET_FOLDER not set');
  }

  const sanitizedSpreadsheetId = sanitizeFilename(spreadsheetId);

  const technicalSpreadsheetId = sanitizedSpreadsheetId.includes(':')
    ? sanitizedSpreadsheetId.split(':')[1]
    : sanitizedSpreadsheetId;

  const buffer = Buffer.from(file);
  const foundProject = await Project.findOne({
    spreadsheetId: { $eq: spreadsheetId },
  });
  if (foundProject) {
    const originalFilePath = `${process.env.DOCBUILDER_SPREADSHEET_FOLDER}/${technicalSpreadsheetId}.xlsx`;
    fs.writeFile(originalFilePath, buffer);
    await refreshProject(foundProject, buffer);
  } else {
    const originalFilePath = `${process.env.DOCBUILDER_SPREADSHEET_FOLDER}/${technicalSpreadsheetId}_original.xlsx`;
    await fs.writeFile(originalFilePath, buffer);

    const optimizedFilePath = `${process.env.DOCBUILDER_SPREADSHEET_FOLDER}/${technicalSpreadsheetId}_optimized.xlsx`;
    await optimizeAndWriteFile(optimizedFilePath, file);
  }
};

router.post('/:spreadsheetId/track', async (req, res) => {
  const { spreadsheetId } = req.params;

  try {
    switch (req.body.status) {
      case DocumentStatus.Save: {
        const { url } = req.body;
        const newUrl = url.replace(
          process.env.ADMIN_DOCUMENTSERVER_URL,
          process.env.PROXY_DOCUMENT_SERVER_URL,
        );
        const response = await fetch(
          newUrl
        );

        if (!response.ok) {
          const error = await (response.text());
          throw new Error('Error on save : ' + error);
        }

        updateFileAndProject(spreadsheetId, await response.arrayBuffer());

        break;
      }
      case DocumentStatus.ForceSave: {
        const { url } = req.body;
        const newUrl = url.replace(
          process.env.ADMIN_DOCUMENTSERVER_URL,
          process.env.PROXY_DOCUMENT_SERVER_URL,
        );
        const response = await fetch(
          newUrl,
        );

        if (!response.ok) {
          const error = await (response.text());
          throw new Error('Error on save : ' + error);
        }

        updateFileAndProject(spreadsheetId, await response.arrayBuffer());

        break;
      }
      default:
        break;
    }

    res.json({ error: 0 });
  } catch (e) {
    console.error(e);
    res.json({ error: 1 });
  }
});

export default router;
