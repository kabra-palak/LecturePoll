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

interface ParticipantInfo {
  participantId: string;
  name?: string;
  role: 'teacher' | 'student';
}

interface ChatMessagePayload {
  text: string;
}

export function registerPollSocketHandlers(io: Server): void {
  const nsp = io.of('/polls');
  const participants = new Map<string, ParticipantInfo>(); // socket.id -> info

  const broadcastParticipants = () => {
    const list = Array.from(participants.values()).map((p) => ({
      id: p.participantId,
      name: p.name,
      role: p.role
    }));
    nsp.emit('participants:update', list);
  };

  nsp.on('connection', async (socket: Socket) => {
    try {
      const state = await pollService.getActivePoll();
      socket.emit('poll:state', state);
    } catch {
      // ignore initial error; client will handle lack of state
    }

    socket.on('participant:join', (info: ParticipantInfo) => {
      participants.set(socket.id, info);
      broadcastParticipants();
    });

    socket.on('disconnect', () => {
      participants.delete(socket.id);
      broadcastParticipants();
    });

    socket.on(
      'teacher:createPoll',
      async (payload: TeacherCreatePollPayload, cb?: (err?: string) => void) => {
        try {
          const poll = await pollService.createPoll(payload);
          nsp.emit('poll:state', poll);
          cb?.();
        } catch (err: any) {
          cb?.(err?.message ?? 'Failed to create poll');
        }
      }
    );

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

    socket.on(
      'teacher:kick',
      (payload: { participantId: string }, cb?: (err?: string) => void) => {
        const targets = Array.from(participants.entries()).filter(
          ([, info]) => info.participantId === payload.participantId
        );
        if (!targets.length) {
          cb?.('Participant not found');
          return;
        }
        for (const [socketId] of targets) {
          const targetSocket = nsp.sockets.get(socketId);
          if (targetSocket) {
            targetSocket.emit('student:kicked', {
              participantId: payload.participantId
            });
            targetSocket.disconnect(true);
          }
          participants.delete(socketId);
        }
        broadcastParticipants();
        cb?.();
      }
    );

    socket.on(
      'student:vote',
      async (payload: StudentVotePayload, cb?: (err?: string) => void) => {
        try {
          const poll = await pollService.submitVote(payload);
          nsp.emit('poll:state', poll);
          cb?.();
        } catch (err: any) {
          cb?.(err?.message ?? 'Failed to submit vote');
        }
      }
    );

    socket.on('chat:send', (payload: ChatMessagePayload, cb?: (err?: string) => void) => {
      const sender = participants.get(socket.id);
      if (!sender) {
        cb?.('Unknown participant');
        return;
      }
      const message = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: payload.text,
        senderId: sender.participantId,
        senderName: sender.name ?? (sender.role === 'teacher' ? 'Teacher' : 'Student'),
        role: sender.role,
        timestamp: new Date().toISOString()
      };
      nsp.emit('chat:message', message);
      cb?.();
    });
  });
}

