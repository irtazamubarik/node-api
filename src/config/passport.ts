import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';

import { User } from '../models/index.model';

import config from './config';
import tokenTypes from './tokens';

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload: { [k: string]: string }, done: any): Promise<VerifiedCallback> => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
export { jwtStrategy };
