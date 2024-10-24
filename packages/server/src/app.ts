/// <reference path="./@types/index.d.ts" />

import * as dotenv from 'dotenv-flow';
dotenv.config();

import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import 'express-async-errors';
import boolParser from 'express-query-boolean';
import { createProxyMiddleware } from 'http-proxy-middleware';
import MailDev from 'maildev';
import {
  authenticate,
  checkIsDocumentServer,
  checkIsInRole,
  or,
} from './authentication/authenticate';
import errorHandler from './middlewares/errorHandler';
import { Role } from './users/model';

import modelsAdminRoutes from './models/adminRoutes';
import modelsPublicRoutes from './models/publicRoutes';
import projectAdminRoutes from './projects/adminRoutes';
import projectPublicRoutes from './projects/publicRoutes';
import reportsPublicRoutes from './reports/publicRoutes';
import simulationPublicRoutes from './simulations/publicRoutes';
import spreadSheetsAdminRoutes from './spreadsheets/adminRoutes';
import userAdminRoutes from './users/adminRoutes';

import authenticationPublicRoutes from './authentication/publicRoutes';
import configurationAdminRoutes from './configuration/adminRoutes';
import configurationPublicRoutes from './configuration/publicRoutes';

import path from 'path';
import seedConfiguration from './configuration/seed';
import connect, { up } from './db';
import seedModels from './models/seed';
import seedUsers from './users/seed';

import injectConfig from './injectConfig';
import { router as queueRoutes } from './queues';

connect().then(async ({ connection }) => {
  try {
    await up(connection);
    seedUsers();
    seedModels();
    seedConfiguration();
  } catch (err) {
    // it might be the first time, seed first to init db, up, then seed again
    console.log(
      "Seems like it's the first time, seeding first before migrating database up",
    );
    console.log(err);
    try {
      await seedUsers();
      await seedModels();
      await up(connection);
      seedUsers();
      seedModels();
    } catch (err) {
      console.log(
        "There was an error seeding the database, let's continue and see",
      );
      console.log(err);
    }
  }
});

const app: Application = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new Sentry.Integrations.Http({ tracing: true })],
  tracesSampleRate: 1.0,
});
app.use(Sentry.Handlers.requestHandler());

if (process.env.PROXY_DOCUMENT_SERVER_URL) {
  if (!process.env.PROXY_HOSTNAME) {
    throw new Error('PROXY_HOSTNAME env variable is required');
  }
  app.use(
    '/docs',
    createProxyMiddleware('/docs', {
      target: process.env.PROXY_DOCUMENT_SERVER_URL,
      ws: true,
      pathRewrite: (path, req) => {
        return path.replace('/docs', '');
      },
      headers: {
        'X-Forwarded-Host': `${process.env.PROXY_HOSTNAME}/docs`,
        'X-Forwarded-Proto': 'https',
      },
    }),
  );
}

if (process.env.MAILDEV_ENABLED === 'true') {
  const maildev = new MailDev({
    basePathname: '/mail',
  } as any);

  maildev.listen((err) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  app.use(
    '/mail',
    createProxyMiddleware('/mail', {
      target: `http://localhost:1080/`,
      ws: true,
    }),
  );
}

const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(',')
  : [];

app.use(
  cors({
    origin: whitelist,
    credentials: true,
    allowedHeaders: [
      'X-Total-Count',
      'Content-Type',
      'Authorization',
      'baggage',
      'sentry-trace',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Forwarded-Host'],
  }),
);

app.use(
  '/',
  injectConfig('FRONT_', 'REACT_APP_'),
  express.static(
    process.env.CLIENT_PATH || path.join(__dirname, '../../client/build'),
    { index: 'index.html' },
  ),
);
app.use(
  '/admin',
  injectConfig('ADMIN_', 'REACT_APP_'),
  express.static(
    process.env.ADMIN_PATH || path.join(__dirname, '../../admin/build'),
    { index: 'index.html' },
  ),
);

app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(boolParser());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/api/authentication', authenticationPublicRoutes);

app.use(authenticate);

app.use(
  '/api/projects',
  checkIsInRole(Role.USER, Role.ADMIN),
  projectPublicRoutes,
);

app.use('/api/simulations', simulationPublicRoutes);

app.use(
  '/api/models',
  checkIsInRole(Role.USER, Role.ADMIN),
  modelsPublicRoutes,
);
app.use(
  '/api/reports',
  checkIsInRole(Role.USER, Role.ADMIN),
  reportsPublicRoutes,
);
app.use('/api/configuration', configurationPublicRoutes);

app.use('/admin/api/projects', checkIsInRole(Role.ADMIN), projectAdminRoutes);
app.use('/admin/api/users', checkIsInRole(Role.ADMIN), userAdminRoutes);
app.use('/admin/api/models', checkIsInRole(Role.ADMIN), modelsAdminRoutes);
app.use(
  '/admin/api/configurations',
  checkIsInRole(Role.ADMIN),
  configurationAdminRoutes,
);

app.use(
  '/admin/api/spreadsheets',
  or(checkIsInRole(Role.ADMIN), checkIsDocumentServer),
  spreadSheetsAdminRoutes,
);

app.get('/admin/*', (req, response) => {
  response.sendFile('index.html', {
    root: process.env.ADMIN_PATH || path.join(__dirname, '../../admin/build'),
  });
});

app.use('/queues', queueRoutes);

app.get('/*', (req, response) => {
  response.sendFile('index.html', {
    root: process.env.CLIENT_PATH || path.join(__dirname, '../../client/build'),
  });
});

app.use(errorHandler);
app.use(Sentry.Handlers.errorHandler());
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running on PORT ${PORT}`);
});
