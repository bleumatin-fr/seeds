import express, { Request } from 'express';
import jwt from 'jsonwebtoken';

import { send } from '../mail';
import { HttpError } from '../middlewares/errorHandler';
import initAccountMail from './initAccountMail';
import User, { Role } from './model';

const router = express.Router();

interface RequestQuery {
  _start: number;
  _end: number;
  _order: 'ASC' | 'DESC';
  _sort: string;
  id?: string[];
  q?: string;
}

const validateEmail = (email: string) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  );
};

router.get('/', async (request, response) => {
  const { _end, _order, _sort, _start, id, q } =
    request.query as unknown as RequestQuery;

  const userCount = await User.count();
  let filter = {};

  if (id && id.length) {
    filter = {
      _id: {
        $in: id,
      },
    };
  }

  if (q) {
    if (validateEmail(q)) {
      filter = { ...filter, email: q };
    } else {
      filter = { ...filter, $text: { $search: q } };
    }
  }

  let sort = {};
  switch (_sort) {
    case 'fullname':
      sort = {
        firstName: _order === 'ASC' ? 1 : -1,
        lastName: _order === 'ASC' ? 1 : -1,
      };
      break;
    default:
      sort = {
        [_sort]: _order === 'ASC' ? 1 : -1,
      };
  }

  const foundUsers = await User.find(filter)
    .sort(sort)
    .skip(_start)
    .limit(_end - _start);

  response.setHeader('X-Total-Count', userCount);

  response.json(foundUsers);
});

router.get('/:id', async (request, response) => {
  const foundUser = await User.findById(request.params.id);
  if (!foundUser) {
    throw new HttpError(404, 'Not found');
  }
  response.json(foundUser);
});

router.post('/', async (request, response) => {
  if (!process.env.RESET_PASSWORD_TOKEN_SECRET) {
    throw new Error('Environment variable RESET_PASSWORD_TOKEN_SECRET not set');
  }
  if (!process.env.INVITATION_TOKEN_EXPIRY) {
    throw new Error('Environment variable INVITATION_TOKEN_EXPIRY not set');
  }

  const userToRegister = new User({
    email: request.body.email,
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    company: request.body.company,
    role: request.body.role,
    optin: request.body.optin,
  });

  await userToRegister.save();

  const payload = {
    id: userToRegister._id,
  };

  const token = jwt.sign(payload, process.env.RESET_PASSWORD_TOKEN_SECRET, {
    expiresIn: eval(process.env.INVITATION_TOKEN_EXPIRY),
  });

  userToRegister.resetPasswordToken = token;
  await userToRegister.save();

  await send({
    to: userToRegister.email,
    from: process.env.MAIL_FROM,
    ...initAccountMail(token),
  });

  response.json(userToRegister);
});

router.put(
  '/:id',
  async (
    request: Request<
      { id: string },
      {},
      {
        email: string;
        firstName: string;
        lastName: string;
        company: string;
        role: Role;
        optin: boolean;
      }
    >,
    response,
  ) => {
    const userToUpdate = await User.findById(request.params.id);

    if (!userToUpdate) {
      throw new HttpError(404, 'Not found');
    }

    await userToUpdate
      .$set({
        email: request.body.email,
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        company: request.body.company,
        role: request.body.role,
        optin: request.body.optin,
      })
      .save();

    response.json(userToUpdate);
  },
);

router.delete('/:id', async (request, response) => {
  const foundUser = await User.findById(request.params.id);
  if (!foundUser) {
    throw new HttpError(404, 'Not found');
  }
  await foundUser.remove();

  response.json(foundUser);
});

export default router;
