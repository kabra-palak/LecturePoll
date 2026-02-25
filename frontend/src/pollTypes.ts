import { useEffect, useState } from 'react';

export type Persona = 'teacher' | 'student';

export type PollOption = {
  id: string;
  label: string;
  isCorrect?: boolean;
  votes: number;
};

export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  durationSeconds: number;
  askedAt?: number;
  isActive: boolean;
};

export type TeacherStats = {
  participantsOnline: number;
  responses: number;
  pollsCreated: number;
};

export type TeacherTab = 'create' | 'live' | 'history';

export const DEFAULT_OPTIONS: PollOption[] = [
  { id: 'a', label: 'Mars', isCorrect: true, votes: 18 },
  { id: 'b', label: 'Venus', votes: 2 },
  { id: 'c', label: 'Jupiter', votes: 3 },
  { id: 'd', label: 'Saturn', votes: 2 }
];

export const createInitialPoll = (): Poll => ({
  id: 'poll-1',
  question: 'Which planet is known as the Red Planet?',
  options: DEFAULT_OPTIONS,
  durationSeconds: 60,
  askedAt: Date.now(),
  isActive: true
});

export const formatSeconds = (totalSeconds: number): string => {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const seconds = clamped % 60;
  const minutes = Math.floor(clamped / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const useRemainingTime = (poll: Poll | null): number => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!poll || !poll.askedAt || !poll.isActive) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [poll?.askedAt, poll?.isActive]);

  if (!poll || !poll.askedAt) return 0;
  const elapsedSeconds = (now - poll.askedAt) / 1000;
  return Math.max(0, poll.durationSeconds - elapsedSeconds);
};

