import httpStatus from 'http-status';
import moment from 'moment';

import config from '../config/config';
import tokenTypes from '../config/tokens';
import { AccessToken } from '../interfaces/token.interface';
import { UserDocument } from '../interfaces/user.interface';
import { Token } from '../models/index.model';
import ApiError from '../utils/ApiError';

import { userService, tokenService } from './index.service';

// Login with email and password
export const loginUserWithEmailAndPassword = async (email: string, password: string): Promise<UserDocument> => {
  const user: any = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password. Please double-check and try again.');
  }
  return user;
};

// Logout
export const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (refreshTokenDoc) {
    await refreshTokenDoc.remove();
  }
};

// Refresh auth tokens
export const refreshAuth = async (refreshToken: string): Promise<AccessToken> => {
  try {
    const refreshTokenDoc: any = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) throw new Error();
    await refreshTokenDoc.remove();

    const accessTokenExpires = moment().add(config.jwt.accessExpirationHours, 'hours');
    const accessToken = tokenService.generateToken(user.id as any, accessTokenExpires, tokenTypes.ACCESS);

    return { access: accessToken, expires: accessTokenExpires.toDate() };
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate, your token has expired.');
  }
};
