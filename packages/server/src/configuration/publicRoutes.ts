import express from 'express';
import Configuration from './model';

const router = express.Router();

router.get('/', async (request, response) => {
  const foundConfiguration = await Configuration.find();

  response.json(
    foundConfiguration.reduce((allConfig, config) => {
      allConfig[config.name] = config.value;
      return allConfig;
    }, {} as { [key: string]: string }),
  );
});

export default router;
