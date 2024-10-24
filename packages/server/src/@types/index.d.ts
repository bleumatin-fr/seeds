declare namespace Express {
  interface Request {
    user: import('./users/model').UserType;
  }
}
declare module 'scmp';
declare module 'express-async-errors';
declare module 'express-query-boolean';
declare module 'migrate-mongo';
