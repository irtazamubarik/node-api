import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

import config from '../config/config';
import ApiError from '../utils/ApiError';

const errorConverter = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, 'critical', false as any, error.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const errorHandlers = (err: any, req: Request, res: Response, next: NextFunction) => {
  let { statusCode, message } = err;
  const { type } = err;

  if (type === 'warn') {
    console.log(`Warning: ${message}`);
  } else if (type === 'info') {
    console.log(`Info: ${message}`);
  } else if (type === 'debug') {
    console.log(`Debug: ${message}`);
  } else if (type === 'critical') {
    console.log('Critical Error:', err, req);
  } else {
    console.log('Error:', err, req);
  }

  if (config.env === 'production' && !err.isOperational && (type === 'error' || type === 'critical')) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    type,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).send(response);
};

export { errorConverter, errorHandlers };
