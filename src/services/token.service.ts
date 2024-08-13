import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import { ObjectId } from 'mongoose';

import config from '../config/config';
import tokenTypes from '../config/tokens';
import { TokenDocument, AuthTokens } from '../interfaces/token.interface';
import { UserDocument } from '../interfaces/user.interface';
import { Token } from '../models/index.model';
import ApiError from '../utils/ApiError';

// Generate token
export const generateToken = (
  userId: ObjectId,
  expires: Moment,
  type: string,
  secret: string = config.jwt.secret,
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

// Save a token
export const saveToken = async (
  token: string,
  userId: ObjectId,
  expires: Moment,
  type: string,
  blacklisted = false,
): Promise<TokenDocument> => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

// Verify token and return token doc (or throw an error if it is not valid)
export const verifyToken = async (token: string, type: string): Promise<TokenDocument> => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub as any, blacklisted: false });
  if (!tokenDoc) throw new ApiError(httpStatus.NOT_FOUND, 'Token not found');
  return tokenDoc;
};

// Generate auth tokens
export const generateAuthTokens = async (user: UserDocument, rememberMe?: boolean): Promise<AuthTokens> => {
  let accessTokenExpires;
  if (!rememberMe) {
    accessTokenExpires = moment().add(config.jwt.accessExpirationHours, 'hours');
  } else {
    accessTokenExpires = moment().add(config.jwt.accessExpirationDays, 'days');
  }
  const accessToken = generateToken(user.id as any, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id as any, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id as any, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};
