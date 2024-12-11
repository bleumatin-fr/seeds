import bcrypt from 'bcrypt';
import crypto from 'crypto';
import express from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import scmp from 'scmp';

import { send } from '../mail';
import { HttpError } from '../middlewares/errorHandler';
import User, { Role, Token } from '../users/model';
import {
  authenticate,
  COOKIE_OPTIONS,
  getAccessToken,
  getRefreshToken,
} from './authenticate';
import recoverMail from './recoverMail';
import sendMessage from './sendMessage';

const router = express.Router();

const verifyOldHash = (
  password: string,
  hash: string,
  salt: string,
): boolean => {
  const hashBuffer = crypto.pbkdf2Sync(password, salt, 25000, 512, 'sha256');
  return scmp(hashBuffer, Buffer.from(hash, 'hex'));
};

router.post('/register', async (request, response) => {
  const salt = await bcrypt.genSalt(
    Number(process.env.PASSWORD_SALT_ROUND) || 10,
  );
  const hashPassword = await bcrypt.hash(request.body.password, salt);

  const userToRegister = new User({
    email: request.body.email,
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    company: request.body.company,
    role: Role.USER,
    hash: hashPassword,
    optin: request.body.optin,
  });

  response.json(await userToRegister.save());
});

router.post('/login', async (request, response) => {
  const user = await User.findOne({ email: { $eq: request.body.email } });
  if (!user) {
    throw new HttpError(401, 'Unauthorized');
  }

  let verifiedPassword = await bcrypt.compare(request.body.password, user.hash);
  if (!verifiedPassword && user.salt) {
    // migration of pw encrypted with former system
    verifiedPassword = verifyOldHash(
      request.body.password,
      user.hash,
      user.salt,
    );

    if (!verifiedPassword) {
      throw new HttpError(401, 'Unauthorized');
    }

    const salt = await bcrypt.genSalt(
      Number(process.env.PASSWORD_SALT_ROUND) || 10,
    );
    const hashPassword = await bcrypt.hash(request.body.password, salt);
    user.salt = undefined;
    user.hash = hashPassword;
    await user.save();
  }
  if (!verifiedPassword) {
    throw new HttpError(401, 'Unauthorized');
  }

  const accessToken = getAccessToken(user);
  const refreshToken = await getRefreshToken(user);

  const now = new Date();
  user.lastLogin = now;
  user.lastActive = now;
  // do not await here, we want to send the response as fast as possible
  user.save();

  response.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  response.send({ success: true, token: accessToken });
});

router.get('/me', authenticate, (request, response) => {
  response.send(request.user);
});

router.put('/me', authenticate, async (request, response) => {
  const user = await User.findById(request.user._id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (request.body.password && request.body.formerPassword) {
    let verifiedPassword = await bcrypt.compare(
      request.body.formerPassword,
      user.hash,
    );
    if (!verifiedPassword) {
      throw new HttpError(401, 'Unauthorized');
    }

    const salt = await bcrypt.genSalt(
      Number(process.env.PASSWORD_SALT_ROUND) || 10,
    );
    const hashPassword = await bcrypt.hash(request.body.password, salt);
    user.hash = hashPassword;
  } else {
    user.set({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      company: request.body.company,
      email: request.body.email,
      optin: request.body.optin,
    });
  }

  response.send(await user.save());
});

router.post('/recover', async (request, response) => {
  const user = await User.findOne({ email: { $eq: request.body.email } });

  if (!user) {
    // always return success, even if the email is not registered
    // to prevent email enumeration
    response.send({ success: true });
    return;
  }

  const payload = {
    id: user._id,
  };
  if (!process.env.RESET_PASSWORD_TOKEN_SECRET) {
    throw new Error('Environment variable RESET_PASSWORD_TOKEN_SECRET not set');
  }
  if (!process.env.JWT_EXPIRY) {
    throw new Error('Environment variable JWT_EXPIRY not set');
  }

  const token = jwt.sign(payload, process.env.RESET_PASSWORD_TOKEN_SECRET, {
    expiresIn: eval(process.env.JWT_EXPIRY),
  });

  user.resetPasswordToken = token;
  await user.save();

  await send({
    to: user.email,
    from: process.env.MAIL_FROM,
    ...recoverMail(token),
  });

  response.send({ success: true, user });

  return;
});

router.post('/reset-password', async (request, response) => {
  const { token: resetPasswordToken, password } = request.body;
  const user = await User.findOne({
    resetPasswordToken: { $eq: resetPasswordToken },
  });

  if (!user) {
    throw new HttpError(401, 'Unauthorized');
  }

  if (!process.env.RESET_PASSWORD_TOKEN_SECRET) {
    throw new Error('Environment variable RESET_PASSWORD_TOKEN_SECRET not set');
  }

  try {
    let payload: any = null;
    payload = jwt.verify(
      resetPasswordToken,
      process.env.RESET_PASSWORD_TOKEN_SECRET,
    );

    if (payload.id !== user._id.toString()) {
      throw new HttpError(401, 'Invalid token');
    }

    const salt = await bcrypt.genSalt(
      Number(process.env.PASSWORD_SALT_ROUND) || 10,
    );
    const hashPassword = await bcrypt.hash(password, salt);
    user.hash = hashPassword;
    user.resetPasswordToken = undefined;

    await user.save();

    response.send({ success: true, user });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new HttpError(401, 'Token expired');
    }
    throw error;
  }
});

router.post('/send-message', authenticate, async (request, response) => {
  const { object, message, url } = request.body;
  try {
    await send({
      to: process.env.MAIL_TO,
      from: process.env.MAIL_FROM,
      ...sendMessage({ object, message, url, user: request.user }),
    });
    response.send({ success: true });
  } catch (error) {
    throw error;
  }
});

router.post('/refresh', async (request, response, next) => {
  const { signedCookies = {} } = request;
  const { refreshToken } = signedCookies;

  if (!refreshToken) {
    throw new HttpError(401, 'Unauthorized');
  }
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('Environment variable REFRESH_TOKEN_SECRET not set');
  }

  const payload: any = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );
  const userId = payload._id;
  if (!userId) {
    throw new HttpError(401, 'Unauthorized');
  }

  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const token = await Token.find({
    value: refreshToken,
    user: user._id,
  });
  if (!token) {
    throw new HttpError(401, 'Unauthorized');
  }

  const newToken = getAccessToken(user);
  const newRefreshToken = await getRefreshToken(user);

  user.lastActive = new Date();
  // do not await here, we want to send the response as fast as possible
  user.save();

  response.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
  response.send({ success: true, token: newToken });
});

router.get('/logout', async (request, response, next) => {
  const { signedCookies = {} } = request;
  const { refreshToken } = signedCookies;

  if (!request.user) {
    throw new Error('No user given');
  }

  const user = await User.findById(request.user._id);
  if (!user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const token = await Token.findOne({
    value: refreshToken,
    user: user._id,
  });

  if (token) {
    await token.deleteOne();
  }

  response.clearCookie('refreshToken', COOKIE_OPTIONS);
  response.send({ success: true });
});

export default router;
