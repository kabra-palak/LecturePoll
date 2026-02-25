import React, { useState } from 'react';
import { Poll, PollOption, TeacherStats, TeacherTab } from './pollTypes';

type TeacherViewProps = {
  teacherTab: TeacherTab;
  setTeacherTab: (tab: TeacherTab) => void;
  activePoll: Poll | null;
  pollHistory: Poll[];
  stats: TeacherStats;
  questionText: string;
  options: PollOption[];
  durationSeconds: number;
  remainingSeconds: number;
  canAskNewQuestion: boolean;
  totalVotes: number;
  onDurationChange: (seconds: number) => void;
  onQuestionTextChange: (value: string) => void;
  onOptionLabelChange: (id: string, label: string) => void;
  onSetCorrect: (id: string, isCorrect: boolean) => void;
  onAddOption: () => void;
  onAskQuestion: () => void;
  onAddQuestion: () => void;
};

const TeacherView: React.FC<TeacherViewProps> = ({
  activePoll,
  totalVotes,
  questionText,
  options,
  durationSeconds,
  canAskNewQuestion,
  onDurationChange,
  onQuestionTextChange,
  onOptionLabelChange,
  onSetCorrect,
  onAddOption,
  onAskQuestion,
  onAddQuestion
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <main style={{ position: 'relative', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ maxWidth: 960, margin: '32px auto 0', padding: '0 16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            marginBottom: 16
          }}
        >
          <div>
            <h1 className="page-title" style={{ marginBottom: 6 }}>
              Let&apos;s Get Started
            </h1>
            <p className="page-subtitle" style={{ maxWidth: 640 }}>
              you&apos;ll have the ability to create and manage polls, ask questions and
              monitor your students reponses in real-time.
            </p>
          </div>
          <button
            type="button"
            title="View poll history"
            style={{
              borderRadius: '999px',
              border: '1px solid var(--border)',
              background: 'var(--white)',
              padding: '6px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.8rem',
              color: 'var(--gray)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
            onClick={() => {
              // Placeholder for future poll history behavior
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--primary-bg)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem'
              }}
            >
              📜
            </span>
            <span>View Poll History</span>
          </button>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div>
            <div className="form-row" style={{ marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="question-input">Your Question</label>
                <input
                  id="question-input"
                  type="text"
                  placeholder="Type your question here..."
                  value={questionText}
                  onChange={(e) => onQuestionTextChange(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="question-duration">Time Limit</label>
                <select
                  id="question-duration"
                  value={durationSeconds}
                  onChange={(e) => onDurationChange(Number(e.target.value))}
                >
                  <option value={30}>30 seconds</option>
                  <option value={45}>45 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={90}>90 seconds</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Options</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {options.map((opt, index) => (
                  <div
                    key={opt.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto minmax(0, 1.5fr) minmax(0, 1fr)',
                      gap: 12,
                      alignItems: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        textAlign: 'center',
                        fontWeight: 600,
                        color: 'var(--gray)'
                      }}
                    >
                      {index + 1}.
                    </div>
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={opt.label}
                      onChange={(e) => onOptionLabelChange(opt.id, e.target.value)}
                    />
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`correct-${opt.id}`}
                          checked={!!opt.isCorrect}
                          onChange={() => onSetCorrect(opt.id, true)}
                        />
                        Correct
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`correct-${opt.id}`}
                          checked={!opt.isCorrect}
                          onChange={() => onSetCorrect(opt.id, false)}
                        />
                        Incorrect
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="add-option"
                type="button"
                style={{ marginTop: 12 }}
                onClick={onAddOption}
              >
                + Add more options
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: 24,
            alignItems: 'flex-start'
          }}
        >
          <div>
            {activePoll ? (
              <div className="card">
                <div className="card-title">Live Results</div>
                <div className="poll-question">{activePoll.question}</div>
                {activePoll.options.map((opt, index) => {
                  const pct = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  const dotClass =
                    index === 0
                      ? 'option-dot a'
                      : index === 1
                      ? 'option-dot b'
                      : index === 2
                      ? 'option-dot c'
                      : 'option-dot d';
                  return (
                    <div key={opt.id} className="result-item">
                      <div className="result-header">
                        <div className="result-label">
                          <span className={dotClass} />
                          {opt.label}
                        </div>
                        <div className="result-pct">{pct}%</div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card">
                <div className="card-title">Live Results</div>
                <p className="page-subtitle">
                  Ask a question to start collecting responses and see results here.
                </p>
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              minHeight: 0
            }}
          >
            <button
              className="btn btn-primary"
              type="button"
              style={{
                width: '100%',
                maxWidth: 220,
                justifyContent: 'center'
              }}
              onClick={onAskQuestion}
              disabled={!canAskNewQuestion}
            >
              Ask Question
            </button>
            <button
              className="btn btn-outline btn-sm"
              type="button"
              style={{ marginTop: 'auto' }}
              onClick={onAddQuestion}
            >
              + Add more questions
            </button>
          </div>
        </div>
      </div>

      {/* Floating chat icon and panel */}
      <button
        type="button"
        onClick={() => setIsChatOpen((open) => !open)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--primary)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
          cursor: 'pointer',
          zIndex: 50
        }}
      >
        💬
      </button>

      {isChatOpen && (
        <div
          className="card"
          style={{
            position: 'fixed',
            bottom: 84,
            right: 24,
            width: 420,
            maxHeight: 360,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: 12,
            padding: 16,
            zIndex: 49
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Chat</div>
            <div
              style={{
                flex: 1,
                minHeight: 120,
                maxHeight: 200,
                overflowY: 'auto',
                background: 'var(--light-gray)',
                borderRadius: 8,
                padding: 8,
                fontSize: '0.8rem'
              }}
            >
              <div style={{ marginBottom: 6 }}>
                <strong>Riya:</strong> I think the answer is Mars.
              </div>
              <div style={{ marginBottom: 6 }}>
                <strong>Arjun:</strong> Same here!
              </div>
              <div>
                <strong>Teacher:</strong> Last 10 seconds, submit your answers now.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem'
                }}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ padding: '6px 10px' }}
              >
                Send
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>
              Participants
            </div>
            <div
              style={{
                maxHeight: 260,
                overflowY: 'auto',
                background: 'var(--light-gray)',
                borderRadius: 8,
                padding: 8,
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              <div>Rahul Bajaj</div>
              <div>Purbashree Bagchi</div>
              <div>Raji Ghosh</div>
              <div>Rakesh Sharma</div>
              <div>Aarav Mehta</div>
              <div>Ananya Singh</div>
              <div>Vikram Joshi</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TeacherView;

