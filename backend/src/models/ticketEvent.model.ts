import mongoose, { Schema, model } from 'mongoose';
import { ITicketEventDocument } from '../types/ticket.types.js';

const ticketEventActorSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'AGENT', 'ADMIN', 'SYSTEM'],
      required: true,
    },
  },
  { _id: false }
);

const ticketEventSchema = new Schema<ITicketEventDocument>(
  {
    ticketId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['CREATED', 'ASSIGNED', 'REASSIGNED', 'REPLIED', 'STATUS_CHANGED'],
      required: true,
    },
    actor: {
      type: ticketEventActorSchema,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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
ticketEventSchema.index({ ticketId: 1, createdAt: 1 });

export const TicketEventModel =
  (mongoose.models.TicketEvent as mongoose.Model<ITicketEventDocument>) ||
  model<ITicketEventDocument>('TicketEvent', ticketEventSchema);
