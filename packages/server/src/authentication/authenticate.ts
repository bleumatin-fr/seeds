import { CookieOptions, NextFunction, Request, Response } from 'express';
import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken';

import { HttpError } from '../middlewares/errorHandler';
import User, { Role, Token, UserType } from '../users/model';

const dev = process.env.NODE_ENV === 'development';

if (!process.env.REFRESH_TOKEN_EXPIRY) {
  throw new Error('Environment variable REFRESH_TOKEN_EXPIRY not set');
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: !dev,
  signed: true,
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
  sameSite: dev ? 'lax' : 'none',
} as CookieOptions;

export const getAccessToken = (user: UserType) => {
  if (!process.env.JWT_EXPIRY) {
    throw new Error('Environment variable JWT_EXPIRY not set');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('Environment variable JWT_SECRET not set');
  }

  const payload = { _id: user._id };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: eval(process.env.JWT_EXPIRY),
  });
  return accessToken;
};

export const getRefreshToken = async (user: UserType) => {
  if (!process.env.REFRESH_TOKEN_EXPIRY) {
    throw new Error('Environment variable REFRESH_TOKEN_EXPIRY not set');
  }
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('Environment variable REFRESH_TOKEN_SECRET not set');
  }
  const payload = { _id: user._id };
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRY),
  });

  const foundUser = await User.findById(user._id);

  if (!foundUser) {
    throw new Error('User not found');
  }

  const newRefreshToken = new Token({
    user: foundUser._id,
    value: refreshToken,
  });
  await newRefreshToken.save();

  return refreshToken;
};

export const authenticate = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Environment variable JWT_SECRET not set');
  }
  const authorization = request.headers.authorization;
  if (authorization) {
    const [_, token] = authorization.split(' ');

    let payload: any = null;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (
        error instanceof JsonWebTokenError ||
        error instanceof TokenExpiredError
      ) {
        throw new HttpError(401, 'Token expired');
      }
    }
    const user = await User.findById(payload._id);
    if (user) {
      request.user = user;
    }
  }

  next();
};

export const checkIsInRole =
  (...roles: Role[]) =>
  (request: Request, response: Response, next: NextFunction) => {
    if (!request.user) {
      throw new HttpError(401, 'Unauthorized');
    }

    const hasRole = roles.find((role) => request.user.role === role);
    if (!hasRole) {
      throw new HttpError(401, 'Unauthorized');
    }

    return next();
  };

export const checkIsDocumentServer = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Environment variable JWT_SECRET not set');
  }
  const authorization = request.headers.authorization;
  if (!authorization) {
    throw new HttpError(401, 'Unauthorized');
  }
  const [_, token] = authorization.split(' ');

  let payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

  if (!payload.users || !payload.users.length) {
    throw new HttpError(401, 'Unauthorized');
  }
  return User.find({ _id: { $in: payload.users } }).then((concernedUsers) => {
    if (!concernedUsers.length) {
      throw new HttpError(401, 'Unauthorized');
    }

    if (!concernedUsers.every((user) => user.role === 'admin')) {
      throw new HttpError(401, 'Unauthorized');
    }
    return next();
  });
};

type MiddleWareFunctionType = (
  request: Request,
  response: Response,
  next: NextFunction,
) => void;

export const or =
  (...fns: MiddleWareFunctionType[]) =>
  (request: Request, response: Response, next: NextFunction) => {
    const fnsExecutionStatuses = fns.map(
      (fn) =>
        new Promise((resolve, reject) => {
          {
            try {
              fn(request, response, () => resolve(true));
            } catch (error) {
              resolve(false);
              return;
            }
          }
        }),
    );

    if (!fnsExecutionStatuses.some((status) => status)) {
      throw new HttpError(401, 'Unauthorized');
    }

    return next();
  };
