import bcrypt from 'bcryptjs';
import mongoose, { ObjectId } from 'mongoose';
import validator from 'validator';

import { UserDocument, UserModel } from '../interfaces/user.interface';

import { toJSON, paginate } from './plugins/index.plugin';

const userSchema = new mongoose.Schema<UserDocument, UserModel>(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value: string) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      required: true,
    },
    firstName: { type: String },
    lastName: { type: String },
    fullName: { type: String },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate as any);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {string} excludeUserId - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */

// for checking email
userSchema.statics.isEmailTaken = async function (email: string, excludeUserId: string): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });

  return !!user;
};
// for checking name
userSchema.statics.isUsernameAlreadyTaken = async function (userName: string, excludeUserId: ObjectId): Promise<boolean> {
  const user = await this.findOne({ userName, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.pre('save', async function (next) {
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

/**
 * @typedef User
 */

const connection = mongoose.connection;
const dbName = connection.name;

export const User = mongoose.model<UserDocument, UserModel>('User', userSchema, dbName);
