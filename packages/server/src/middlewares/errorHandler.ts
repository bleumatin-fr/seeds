import { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  public status: number;
  public message: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export default (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (error instanceof HttpError) {
    response.status(error.status || 500);
    response.send({
      message: error.message,
      error: error,
    });
    return;
  }
  console.error(error);
  response.status(500);
  response.send({
    message: error.message,
    error: error,
  });
};
