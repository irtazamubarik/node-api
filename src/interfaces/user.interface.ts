import { Model, ObjectId } from 'mongoose';

export interface UserDocument {
  id?: ObjectId;
  userName: string;
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface UserModel extends Model<UserDocument> {
  isEmailTaken(email: string, excludeUserId?: ObjectId): boolean;
  isUsernameAlreadyTaken(userName: string, excludeUserId?: ObjectId): boolean;
  toJSON(schema: any): void;
  paginate(filter: any, options: any): any;
}
