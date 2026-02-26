import React, { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  Persona,
  Poll,
  PollOption,
  TeacherStats,
  TeacherTab,
  useRemainingTime
} from './pollTypes';
import HomePage from './HomePage';
import TeacherView from './TeacherView';
import StudentView from './StudentView';

const App: React.FC = () => {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [pendingPersona, setPendingPersona] = useState<Persona | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('create');
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [pollHistory, setPollHistory] = useState<Poll[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    participantsOnline: 24,
    responses: 18,
    pollsCreated: 3
  });

  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: 'a', label: '', votes: 0 },
    { id: 'b', label: '', votes: 0 }
  ]);
  const [durationSeconds, setDurationSeconds] = useState<number>(60);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [participantId] = useState<string>(() => {
    if (typeof window === 'undefined') return `p-${Date.now()}`;
    const key = 'lecturepoll_participant_id';
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const generated =
      (window.crypto?.randomUUID?.() as string | undefined) ??
      `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.sessionStorage.setItem(key, generated);
    return generated;
  });

  const remainingSeconds = useRemainingTime(activePoll);

  useEffect(() => {
    const savedName = window.sessionStorage.getItem('lecturepoll_student_name');
    if (savedName) {
      setStudentName(savedName);
    }
  }, []);

  useEffect(() => {
    if (studentName) {
      window.sessionStorage.setItem('lecturepoll_student_name', studentName);
    }
  }, [studentName]);

  useEffect(() => {
    const s = io('http://localhost:4000/polls', {
      transports: ['websocket']
    });
    setSocket(s);

    s.on('poll:state', (serverPoll: any) => {
      if (!serverPoll) {
        setActivePoll(null);
        return;
      }

      const mapped: Poll = {
        id: serverPoll.id,
        question: serverPoll.question,
        options: serverPoll.options.map((opt: any) => ({
          id: opt.id,
          label: opt.label,
          isCorrect: opt.isCorrect,
          votes: opt.votes
        })),
        durationSeconds: serverPoll.durationSeconds,
        askedAt: new Date(serverPoll.askedAt).getTime(),
        isActive: serverPoll.status === 'active'
      };

      setActivePoll(mapped);
      setQuestionText(serverPoll.question);
      setOptions(mapped.options);
      setDurationSeconds(serverPoll.durationSeconds);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const totalVotes = useMemo(
    () => (activePoll ? activePoll.options.reduce((sum, opt) => sum + opt.votes, 0) : 0),
    [activePoll]
  );

  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        id: `opt-${prev.length + 1}`,
        label: `Option ${prev.length + 1}`,
        votes: 0
      }
    ]);
  };

  const handleSetCorrect = (id: string, isCorrect: boolean) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, isCorrect } : opt))
    );
  };

  const handleOptionLabelChange = (id: string, label: string) => {
    setOptions((prev) => prev.map((opt) => (opt.id === id ? { ...opt, label } : opt)));
  };

  const handleAddQuestionEditor = () => {
    setQuestionText('');
    setOptions([
      { id: 'a', label: '', votes: 0 },
      { id: 'b', label: '', votes: 0 }
    ]);
    setDurationSeconds(60);
  };

  const handleAskQuestion = () => {
    if (!questionText.trim() || options.length < 2 || !socket) return;

    socket.emit(
      'teacher:createPoll',
      {
        question: questionText.trim(),
        options: options.map((opt) => ({
          label: opt.label,
          isCorrect: !!opt.isCorrect
        })),
        durationSeconds
      },
      (err?: string) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to create poll', err);
        } else {
          setTeacherTab('live');
          setStats((prev) => ({
            ...prev,
            pollsCreated: prev.pollsCreated + 1,
            responses: 0
          }));
        }
      }
    );
  };

  const canAskNewQuestion = useMemo(() => {
    if (!activePoll) return true;
    if (!activePoll.isActive) return true;
    return remainingSeconds <= 0;
  }, [activePoll, remainingSeconds]);

  const handleTimerComplete = () => {
    if (!activePoll || !activePoll.isActive) return;
    setActivePoll({ ...activePoll, isActive: false });
  };

  useEffect(() => {
    if (remainingSeconds <= 0 && activePoll?.isActive) {
      handleTimerComplete();
    }
  }, [remainingSeconds, activePoll]);

  const renderNav = () => {
    const personaLabel = persona === 'teacher' ? 'Teacher View' : 'Student View';
    const badgeClass = persona === 'teacher' ? 'badge teacher' : 'badge student';
    const avatarLetter =
      persona === 'teacher'
        ? 'T'
        : persona === 'student' && studentName
        ? studentName[0]?.toUpperCase()
        : 'P';

    return (
      <nav>
        <div className="nav-logo">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M8 12h8M12 8v8" />
          </svg>
          Intervue<span>Poll</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {persona && <span className={badgeClass}>{personaLabel}</span>}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            {avatarLetter}
          </div>
        </div>
      </nav>
    );
  };

  if (!persona) {
    return (
      <>
        {renderNav()}
        <main>
          <HomePage
            selectedPersona={pendingPersona}
            onSelectPersona={setPendingPersona}
            onContinue={() => {
              if (pendingPersona) {
                setPersona(pendingPersona);
              }
            }}
          />
        </main>
      </>
    );
  }

  return (
    <>
      {renderNav()}
      {persona === 'teacher' ? (
        <TeacherView
          teacherTab={teacherTab}
          setTeacherTab={setTeacherTab}
          activePoll={activePoll}
          pollHistory={pollHistory}
          stats={stats}
          questionText={questionText}
          options={options}
          durationSeconds={durationSeconds}
          remainingSeconds={remainingSeconds}
          canAskNewQuestion={canAskNewQuestion}
          totalVotes={totalVotes}
          onDurationChange={setDurationSeconds}
          onQuestionTextChange={setQuestionText}
          onOptionLabelChange={handleOptionLabelChange}
          onSetCorrect={handleSetCorrect}
          onAddOption={handleAddOption}
          onAskQuestion={handleAskQuestion}
          onAddQuestion={handleAddQuestionEditor}
        />
      ) : (
        <StudentView
          studentName={studentName}
          setStudentName={setStudentName}
          activePoll={activePoll}
          remainingSeconds={remainingSeconds}
          totalVotes={totalVotes}
          onSubmitVote={(optionId) => {
            if (!activePoll || !socket) return;
            socket.emit(
              'student:vote',
              {
                pollId: activePoll.id,
                optionId,
                participantId,
                participantName: studentName ?? undefined
              },
              (err?: string) => {
                if (err) {
                  // eslint-disable-next-line no-console
                  console.error('Failed to submit vote', err);
                } else {
                  setStats((prev) => ({ ...prev, responses: prev.responses + 1 }));
                }
              }
            );
          }}
        />
      )}
    </>
  );
};

export default App;

