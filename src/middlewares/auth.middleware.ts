import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import passport from 'passport';

import { roleRights } from '../config/roles';
import { UserDocument } from '../interfaces/user.interface';
import ApiError from '../utils/ApiError';

const verifyCallback =
  (req: Request, resolve: any, reject: any, requiredRights: string[]) =>
  async (err: ApiError, user: UserDocument, info: any) => {
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    req.user = user as UserDocument;
    if (requiredRights.length) {
      const userRights = roleRights.get(user.role);
      const hasRequiredRights = requiredRights.every(
        (requiredRight: string) => userRights && userRights.includes(requiredRight),
      );
      if (!hasRequiredRights && req.params.userId !== (user.id as any)) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden', 'error'));
      }
    }

    resolve();
  };

const auth =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };
export default auth;
