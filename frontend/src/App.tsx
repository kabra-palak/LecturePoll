import React, { useEffect, useMemo, useState } from 'react';
import {
  Persona,
  Poll,
  PollOption,
  TeacherStats,
  TeacherTab,
  DEFAULT_OPTIONS,
  createInitialPoll,
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
  const [activePoll, setActivePoll] = useState<Poll | null>(() => createInitialPoll());
  const [pollHistory, setPollHistory] = useState<Poll[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    participantsOnline: 24,
    responses: 18,
    pollsCreated: 3
  });

  const [questionText, setQuestionText] = useState(activePoll?.question ?? '');
  const [options, setOptions] = useState<PollOption[]>(() => activePoll?.options ?? DEFAULT_OPTIONS);
  const [durationSeconds, setDurationSeconds] = useState<number>(60);

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
    if (!questionText.trim() || options.length < 2) return;

    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      question: questionText.trim(),
      options: options.map((opt) => ({ ...opt, votes: 0 })),
      durationSeconds,
      askedAt: Date.now(),
      isActive: true
    };

    if (activePoll) {
      setPollHistory((prev) => [...prev, { ...activePoll, isActive: false }]);
    }

    setActivePoll(newPoll);
    setTeacherTab('live');
    setStats((prev) => ({
      ...prev,
      pollsCreated: prev.pollsCreated + 1,
      responses: 0
    }));
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
            if (!activePoll) return;
            const updatedOptions = activePoll.options.map((opt) =>
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            );
            setActivePoll({ ...activePoll, options: updatedOptions });
            setStats((prev) => ({ ...prev, responses: prev.responses + 1 }));
          }}
        />
      )}
    </>
  );
};

export default App;

