import mongoose, { Schema, model } from 'mongoose';
import { IUserDocument } from '../types/user.types.js';

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['AGENT', 'ADMIN'],
      default: 'AGENT',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as Record<string, any>;
        obj.id = obj._id?.toString();
        delete obj._id;
        delete obj.__v;
        delete obj.passwordHash;
        return obj;
      },
    },
  }
);

// Indexes
userSchema.index({ role: 1, isActive: 1 });

export const UserModel =
  (mongoose.models.User as mongoose.Model<IUserDocument>) ||
  model<IUserDocument>('User', userSchema);
