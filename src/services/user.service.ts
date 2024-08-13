import httpStatus from 'http-status';
import { ObjectId } from 'mongoose';

import { UserDocument } from '../interfaces/user.interface';
import { User } from '../models/index.model';
import ApiError from '../utils/ApiError';

export const createUser = async (userBody: { [k: string]: any }): Promise<UserDocument> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'The provided email is already in use. Please use a different email address.',
    );
  }
  if (await User.isUsernameAlreadyTaken(userBody.userName)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'The chosen username is already taken. Please choose a different unique username.',
    );
  }
  const user = await User.create({ ...userBody });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You account could not be created. Please try again or contact support.');
  }

  return user;
};

export const checkUsername = async (username: string): Promise<string> => {
  if (await User.isUsernameAlreadyTaken(username)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'The chosen username is already taken. Please choose a different unique username.',
    );
  }
  return 'The username is available and can be used.';
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
export const queryUsers = async (filter: object, options: object): Promise<UserDocument[]> => {
  const users = await User.paginate(filter, options);
  return users;
};

export const getUserById = async (id: ObjectId): Promise<UserDocument> => {
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'The user account was not found.');
  }

  return user;
};

export const getUserByEmail = async (email: string): Promise<UserDocument> => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'The user account was not found.');
  }

  return user;
};

export const updateUserById = async (userId: ObjectId, updateBody: { [k: string]: any }): Promise<UserDocument> => {
  const user = await getUserById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'The user account was not found.');
  }
  if (!updateBody.userName) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid username.');
  }
  if (!updateBody.email) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid email address.');
  }

  const userEmail = await User.findOne({ email: updateBody.email });
  if (userEmail && userEmail.id != userId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'The provided email address is already associated with another user. Please use a different email.',
    );
  }

  await checkUsername(updateBody.userName);

  Object.assign(user as UserDocument, updateBody as UserDocument);
  await (user as any).save();
  return user;
};

export const updateUserInformationById = async (
  userId: ObjectId,
  updateBody: { [k: string]: any },
): Promise<UserDocument> => {
  const user = await getUserById(userId);
  Object.assign(user as UserDocument, updateBody as UserDocument);
  await (user as any).save();
  return user;
};

export const updateUserProfile = async (userId: ObjectId, updatedData: { [k: string]: any }): Promise<UserDocument> => {
  const user = await getUserById(userId);

  Object.assign(user as UserDocument, updatedData as UserDocument);
  await (user as any).save();
  return user;
};

export const deleteUserById = async (userId: ObjectId): Promise<UserDocument> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'The user account was not found.');
  }
  await (user as any).remove();
  return user;
};
