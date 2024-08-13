import compression from 'compression';
import cors from 'cors';
import express, { Request, Response, NextFunction, Application } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import httpStatus from 'http-status';
import passport from 'passport';
import xss from 'xss-clean';

import config from './config/config';
import { jwtStrategy } from './config/passport';
import { UserDocument } from './interfaces/user.interface';
import auth from './middlewares/auth.middleware';
import { errorConverter, errorHandlers } from './middlewares/error.middleware';
import authLimiter from './middlewares/rateLimiter.middleware';
import router from './routes/v1/index.route';
import ApiError from './utils/ApiError';

const app: Application = express();

app.use(express.json());

// set security HTTP headers
app.use(helmet());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (['production', 'staging'].includes(config.env)) {
  app.use('/v1/auth', authLimiter);
}

// app.use(async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     await auth()(req, res, () => {
//       next();
//     });

//     if (req.isAuthenticated()) {
//       const { userName, email, id } = req.user as UserDocument;
//       console.log(`Authenticated user: ${userName}`);
//       const userId = (id || {}).toString();
//       console.log(`User ID: ${userId}`);
//       console.log(`User Email: ${email}`);
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// v1 api routes
app.use('/v1', router);

// send back a 404 error for any unknown api request
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found', 'error'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandlers);

export default app;
