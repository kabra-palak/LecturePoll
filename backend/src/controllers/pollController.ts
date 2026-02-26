import type { Request, Response } from 'express';
import { PollService } from '../services/pollService.js';

const pollService = new PollService();

export class PollController {
  async getCurrentPoll(_req: Request, res: Response): Promise<void> {
    try {
      const poll = await pollService.getActivePoll();
      res.json(poll);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch current poll' });
    }
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    const rawLimit = req.query.limit;
    const limit =
      typeof rawLimit === 'string' && rawLimit.length > 0 ? Number(rawLimit) : undefined;
    try {
      const polls = await pollService.getPollHistory(limit);
      res.json(polls);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch poll history' });
    }
  }

  async createPoll(req: Request, res: Response): Promise<void> {
    const { question, options, durationSeconds, expectedParticipants } = req.body ?? {};

    if (!question || !Array.isArray(options) || !durationSeconds) {
      res.status(400).json({ error: 'question, options and durationSeconds are required' });
      return;
    }

    try {
      const poll = await pollService.createPoll({
        question,
        options,
        durationSeconds,
        expectedParticipants
      });
      res.status(201).json(poll);
    } catch (err: any) {
      res.status(400).json({ error: err.message ?? 'Failed to create poll' });
    }
  }
}

export const pollController = new PollController();

