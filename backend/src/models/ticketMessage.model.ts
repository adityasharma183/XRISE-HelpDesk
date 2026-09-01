import mongoose, { Schema, model } from 'mongoose';
import { ITicketMessageDocument } from '../types/ticket.types.js';

const ticketMessageSchema = new Schema<ITicketMessageDocument>(
  {
    ticketId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    senderType: {
      type: String,
      enum: ['CUSTOMER', 'AGENT'],
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Message body is required'],
      trim: true,
      minlength: [1, 'Message body cannot be empty'],
      maxlength: [5000, 'Message body cannot exceed 5000 characters'],
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

// Indexes
ticketMessageSchema.index({ ticketId: 1, createdAt: 1 });

export const TicketMessageModel =
  (mongoose.models.TicketMessage as mongoose.Model<ITicketMessageDocument>) ||
  model<ITicketMessageDocument>('TicketMessage', ticketMessageSchema);
