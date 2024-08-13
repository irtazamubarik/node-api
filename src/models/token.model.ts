import mongoose from 'mongoose';

import tokenTypes from '../config/tokens';
import { TokenDocument } from '../interfaces/token.interface';

import { toJSON } from './plugins/index.plugin';

const tokenSchema = new mongoose.Schema<TokenDocument>(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD, tokenTypes.VERIFY_EMAIL],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
tokenSchema.plugin(toJSON);

/**
 * @typedef Token
 */

const connection = mongoose.connection;
const dbName = connection.name;

export const Token = mongoose.model<TokenDocument>('Token', tokenSchema, dbName);
// export default Token;
