import { ObjectId } from 'mongoose';

interface TokenDocument {
  token: string;
  user: ObjectId;
  type: string;
  expires: Date;
  blacklisted: boolean;
}

interface AuthTokens {
  access: {
    token: string;
    expires: Date;
  };
  refresh: {
    token: string;
    expires: Date;
  };
}

interface AccessToken {
  access: string;
  expires: Date;
}

export { TokenDocument, AuthTokens, AccessToken };
