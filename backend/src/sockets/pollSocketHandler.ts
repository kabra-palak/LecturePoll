import type { Server, Socket } from 'socket.io';
import { PollService } from '../services/pollService.js';

const pollService = new PollService();

interface TeacherCreatePollPayload {
  question: string;
  options: { label: string; isCorrect?: boolean }[];
  durationSeconds: number;
  expectedParticipants?: number;
}

interface StudentVotePayload {
  pollId: string;
  optionId: string;
  participantId: string;
  participantName?: string;
}

export function registerPollSocketHandlers(io: Server): void {
  const nsp = io.of('/polls');

  nsp.on('connection', async (socket: Socket) => {
    try {
      const state = await pollService.getActivePoll();
      socket.emit('poll:state', state);
    } catch {
      // ignore initial error; client will handle lack of state
    }

    socket.on('teacher:createPoll', async (payload: TeacherCreatePollPayload, cb?: (err?: string) => void) => {
      try {
        const poll = await pollService.createPoll(payload);
        nsp.emit('poll:state', poll);
        cb?.();
      } catch (err: any) {
        cb?.(err?.message ?? 'Failed to create poll');
      }
    });

    socket.on('teacher:endPoll', async (cb?: (err?: string) => void) => {
      try {
        const poll = await pollService.endActivePoll();
        if (poll) {
          nsp.emit('poll:state', poll);
        }
        cb?.();
      } catch (err: any) {
        cb?.(err?.message ?? 'Failed to end poll');
      }
    });

    socket.on('student:vote', async (payload: StudentVotePayload, cb?: (err?: string) => void) => {
      try {
        const poll = await pollService.submitVote(payload);
        nsp.emit('poll:state', poll);
        cb?.();
      } catch (err: any) {
        cb?.(err?.message ?? 'Failed to submit vote');
      }
    });
  });
}

