import { Types } from 'mongoose';
import { PollDocument, PollModel } from '../models/Poll.js';
import { VoteModel } from '../models/Vote.js';

export interface CreatePollInput {
  question: string;
  options: { label: string; isCorrect?: boolean }[];
  durationSeconds: number;
  expectedParticipants?: number;
}

export interface PollOptionResult {
  id: string;
  label: string;
  isCorrect: boolean;
  votes: number;
}

export interface PollState {
  id: string;
  question: string;
  options: PollOptionResult[];
  durationSeconds: number;
  askedAt: string;
  status: 'active' | 'closed';
  expectedParticipants?: number;
}

export class PollService {
  async getActivePoll(): Promise<PollState | null> {
    const poll = await PollModel.findOne({ status: 'active' }).sort({ createdAt: -1 }).lean();
    if (!poll) return null;
    const optionsWithVotes = await this.getOptionResults(poll._id, poll);
    return this.mapPollState(poll, optionsWithVotes);
  }

  async getPollHistory(limit?: number): Promise<PollState[]> {
    let query = PollModel.find({ status: 'closed' }).sort({ createdAt: -1 });
    if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
      query = query.limit(limit);
    }
    const polls = await query.lean();

    const results: PollState[] = [];
    for (const poll of polls) {
      const optionsWithVotes = await this.getOptionResults(poll._id, poll);
      results.push(this.mapPollState(poll, optionsWithVotes));
    }
    return results;
  }

  async createPoll(input: CreatePollInput): Promise<PollState> {
    if (!input.options || input.options.length < 2) {
      throw new Error('At least two options are required.');
    }

    await PollModel.updateMany(
      { status: 'active' },
      { $set: { status: 'closed' } }
    );

    const created = await PollModel.create({
      question: input.question,
      options: input.options.map((opt) => ({
        label: opt.label,
        isCorrect: !!opt.isCorrect
      })),
      durationSeconds: input.durationSeconds,
      expectedParticipants: input.expectedParticipants,
      askedAt: new Date(),
      status: 'active'
    });

    return this.mapPollState(created.toObject(), created.options.map((opt) => ({
      id: opt._id.toString(),
      label: opt.label,
      isCorrect: opt.isCorrect,
      votes: 0
    })));
  }

  async endActivePoll(): Promise<PollState | null> {
    const poll = await PollModel.findOneAndUpdate(
      { status: 'active' },
      { $set: { status: 'closed' } },
      { new: true }
    );
    if (!poll) return null;
    const optionsWithVotes = await this.getOptionResults(poll._id, poll);
    return this.mapPollState(poll.toObject(), optionsWithVotes);
  }

  async submitVote(params: {
    pollId: string;
    optionId: string;
    participantId: string;
    participantName?: string;
  }): Promise<PollState> {
    const pollObjectId = new Types.ObjectId(params.pollId);
    const poll = await PollModel.findById(pollObjectId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    const now = Date.now();
    const expiresAt = poll.askedAt.getTime() + poll.durationSeconds * 1000;
    if (now > expiresAt || poll.status !== 'active') {
      throw new Error('Poll is closed');
    }

    try {
      await VoteModel.create({
        pollId: pollObjectId,
        optionId: new Types.ObjectId(params.optionId),
        participantId: params.participantId,
        participantName: params.participantName
      });
    } catch (err: any) {
      if (err?.code !== 11000) {
        throw err;
      }
      // duplicate vote for this participant & poll: treat as no-op
    }

    const optionsWithVotes = await this.getOptionResults(pollObjectId, poll.toObject());
    return this.mapPollState(poll.toObject(), optionsWithVotes);
  }

  private async getOptionResults(
    pollId: Types.ObjectId,
    poll: PollDocument | (PollDocument & { _id: Types.ObjectId })
  ): Promise<PollOptionResult[]> {
    const aggregates = await VoteModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { pollId } },
      { $group: { _id: '$optionId', count: { $sum: 1 } } }
    ]);

    const countMap = new Map<string, number>();
    for (const row of aggregates) {
      countMap.set(row._id.toString(), row.count);
    }

    return poll.options.map((opt) => ({
      id: opt._id.toString(),
      label: opt.label,
      isCorrect: opt.isCorrect,
      votes: countMap.get(opt._id.toString()) ?? 0
    }));
  }

  private mapPollState(poll: PollDocument | any, options: PollOptionResult[]): PollState {
    return {
      id: poll._id.toString(),
      question: poll.question,
      options,
      durationSeconds: poll.durationSeconds,
      askedAt: poll.askedAt.toISOString(),
      status: poll.status,
      expectedParticipants: poll.expectedParticipants
    };
  }
}

