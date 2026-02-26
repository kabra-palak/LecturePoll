import mongoose, { Schema, Types } from 'mongoose';

export type PollStatus = 'active' | 'closed';

export interface PollOptionSchema {
  _id: Types.ObjectId;
  label: string;
  isCorrect: boolean;
}

export interface PollDocument {
  _id: Types.ObjectId;
  question: string;
  options: PollOptionSchema[];
  durationSeconds: number;
  askedAt: Date;
  status: PollStatus;
  expectedParticipants?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PollOptionSchema = new Schema<PollOptionSchema>(
  {
    label: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  },
  { _id: true }
);

const PollSchema = new Schema<PollDocument>(
  {
    question: { type: String, required: true },
    options: { type: [PollOptionSchema], required: true },
    durationSeconds: { type: Number, required: true, min: 1, max: 600 },
    askedAt: { type: Date, required: true, default: () => new Date() },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    expectedParticipants: { type: Number }
  },
  {
    timestamps: true
  }
);

export const PollModel = mongoose.model<PollDocument>('Poll', PollSchema);

