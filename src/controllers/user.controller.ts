import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { userService } from '../services/index.service';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';

export const createUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

export const getUsers = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

export const getUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.getUserById(req.params.userId as any);
  res.send(user);
});

export const updateUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.updateUserById(req.params.userId as any, req.body);
  res.send({ user });
});

export const updateUserInformation = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.updateUserInformationById(req.params.userId as any, req.body);
  res.send(user);
});

export const updateUserSelectedItems = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.updateUserProfile(req.params.userId as any, req.body);
  res.send(user);
});

export const deleteUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  await userService.deleteUserById(req.params.userId as any);
  res.status(httpStatus.NO_CONTENT).send();
});
