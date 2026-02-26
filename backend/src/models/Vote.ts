import mongoose, { Schema, Types } from 'mongoose';

export interface VoteDocument {
  _id: Types.ObjectId;
  pollId: Types.ObjectId;
  optionId: Types.ObjectId;
  participantId: string;
  participantName?: string;
  createdAt: Date;
}

const VoteSchema = new Schema<VoteDocument>(
  {
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    optionId: { type: Schema.Types.ObjectId, required: true },
    participantId: { type: String, required: true },
    participantName: { type: String }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

VoteSchema.index({ pollId: 1, participantId: 1 }, { unique: true });

export const VoteModel = mongoose.model<VoteDocument>('Vote', VoteSchema);

