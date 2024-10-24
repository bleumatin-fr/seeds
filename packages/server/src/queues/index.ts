import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Queue from 'bull';
import path from 'path';
import migrateProject, { MigrateProjectJob } from './migrateProject';

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error('REDIS_URL is not defined');
}

const registerQueue = <T>(
  queue: Queue.Queue,
  processFunction: Queue.ProcessCallbackFunction<T>,
  processFile: string,
) => {
  if (process.env.NODE_ENV === 'development') {
    // in development mode we want to use ts
    queue.process(processFunction);
    queue.on('completed', (job) => {
      console.log(`Job with id ${job.id} has been completed`);
    });
    queue.on('failed', (job, err) => {
      console.log(`Job with id ${job.id} has failed: ${err.message}`);
    });
  } else {
    console.log(
      `Using compiled file ${processFile} from ${__dirname}: ${path.join(
        __dirname,
        processFile,
      )}`,
    );
    queue.process(path.join(__dirname, processFile));
  }
};

export const migrateProjectQueue = new Queue<MigrateProjectJob>(
  'migrateProject',
  REDIS_URL,
);

registerQueue<MigrateProjectJob>(
  migrateProjectQueue,
  migrateProject,
  '../queues/migrateProject',
);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/queues');

createBullBoard({
  queues: [new BullAdapter(migrateProjectQueue)],
  serverAdapter: serverAdapter,
});

export const router = serverAdapter.getRouter();
