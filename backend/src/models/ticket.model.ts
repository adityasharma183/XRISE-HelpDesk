import mongoose, { Schema, model } from 'mongoose';
import { ITicketDocument } from '../types/ticket.types.js';

const attachmentSchema = new Schema(
  {
    url:       { type: String, required: true },
    publicId:  { type: String, required: true },
    fileName:  { type: String, required: true },
    mimeType:  { type: String, required: true },
    size:      { type: Number, required: true },
  },
  { _id: false }
);

const ticketCustomerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
  },
  { _id: false }
);

const ticketSchema = new Schema<ITicketDocument>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    customer: {
      type: ticketCustomerSchema,
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [3, 'Subject must be at least 3 characters long'],
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true,
      minlength: [10, 'Body must be at least 10 characters long'],
      maxlength: [5000, 'Body cannot exceed 5000 characters'],
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      required: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    aiCache: {
      analysis: {
        type: Schema.Types.Mixed,
        default: null,
      },
      summary: {
        type: Schema.Types.Mixed,
        default: null,
      },
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
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
        return obj;
      },
    },
  }
);

// Indexes for query optimization
ticketSchema.index({ 'customer.email': 1 });
ticketSchema.index({ assignee: 1, status: 1, createdAt: -1 });
ticketSchema.index({ assignee: 1, priority: 1, createdAt: -1 });
ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ priority: 1, createdAt: -1 });
ticketSchema.index(
  { subject: 'text', body: 'text' },
  { weights: { subject: 10, body: 5 }, name: 'TicketTextIndex' }
);

export const TicketModel =
  (mongoose.models.Ticket as mongoose.Model<ITicketDocument>) ||
  model<ITicketDocument>('Ticket', ticketSchema);
