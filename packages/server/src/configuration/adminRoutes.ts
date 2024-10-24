import express, { Request } from 'express';
import { SortOrder } from 'mongoose';
import { HttpError } from '../middlewares/errorHandler';
import Configuration from './model';

const router = express.Router();

interface RequestQuery {
  _start: number;
  _end: number;
  _order: 'ASC' | 'DESC';
  _sort: string;
}

router.get(
  '/',
  async (request: Request<{}, {}, {}, RequestQuery>, response) => {
    const {
      _end,
      _order,
      _sort,
      _start,
    } = request.query;

    const configurationCount = await Configuration.count();


    let sort: { [key: string]: SortOrder } = {
      [_sort]: _order === 'ASC' ? 1 : -1,
      name: _sort === 'name' ? (_order === 'ASC' ? 1 : -1) : 1,
    };

    const foundConfiguration = await Configuration.find()
      .sort(sort)
      .skip(_start)
      .limit(_end - _start);

    response.setHeader('X-Total-Count', configurationCount);

    response.json(foundConfiguration);
  },
);

router.get('/:id', async (request, response) => {
  const foundConfiguration = await Configuration.findOne({ _id: request.params.id });
  if (!foundConfiguration) {
    throw new HttpError(404, 'Not found');
  }
  response.json(foundConfiguration);
});

router.post('/', async (request, response) => {
  const newConfiguration = new Configuration(request.body);
  response.json(await newConfiguration.save());
});

router.put(
  '/:id',
  async (request: Request<{ id: string }, {}, { name: string }>, response) => {
    const newConfiguration = await Configuration.findOneAndUpdate(
      { _id: request.params.id },
      request.body,
      {
        upsert: false,
        new: true,
      },
    );
    if (!newConfiguration) {
      throw new HttpError(404, 'Not found');
    }
    response.json(newConfiguration);
  },
);

router.delete('/:id', async (request, response) => {
  const foundConfiguration = await Configuration.findById(request.params.id);
  if (!foundConfiguration) {
    throw new HttpError(404, 'Not found');
  }

  await foundConfiguration.remove();

  response.json(foundConfiguration);
});

export default router;
