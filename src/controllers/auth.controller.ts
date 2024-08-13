import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { roleRights } from '../config/roles';
import { authService, userService, tokenService } from '../services/index.service';
import catchAsync from '../utils/catchAsync';

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

export const checkUsername = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const message = await userService.checkUsername(req.body?.userName);
  res.status(httpStatus.CREATED).send({ message });
});

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password, rememberMe } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);

  const tokens = await tokenService.generateAuthTokens(user, rememberMe);
  const permissions = roleRights.get(user.role) || [];
  res.send({ user, tokens, permissions });
});

export const whoAmI = catchAsync(async (req: Request, res: Response): Promise<void> => {
  res.status(httpStatus.OK).send(req.user);
});

export const logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const refreshTokens = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send(tokens);
});
