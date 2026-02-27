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
  participants: { id: string; name?: string; role: 'teacher' | 'student' }[];
  onKickParticipant: (id: string) => void;
  chatMessages: {
    id: string;
    text: string;
    senderName: string;
    role: 'teacher' | 'student';
    timestamp: string;
  }[];
  onSendChatMessage: (text: string) => void;
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
  onAddQuestion,
  participants,
  onKickParticipant,
  chatMessages,
  onSendChatMessage
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<
    { id: string; question: string; options: { label: string; votes: number }[] }[]
  >([]);
  const [activeChatTab, setActiveChatTab] = useState<'chat' | 'participants'>('chat');

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
            onClick={async () => {
              try {
                setIsHistoryOpen(true);
                setIsHistoryLoading(true);
                setHistoryError(null);
                const res = await fetch('http://localhost:4000/api/polls/history');
                if (!res.ok) {
                  throw new Error('Failed to load history');
                }
                const data: {
                  id: string;
                  question: string;
                  options: { id: string; label: string; votes: number }[];
                }[] = await res.json();
                setHistoryItems(
                  data.map((poll) => ({
                    id: poll.id,
                    question: poll.question,
                    options: poll.options.map((opt) => ({
                      label: opt.label,
                      votes: opt.votes
                    }))
                  }))
                );
              } catch (err: any) {
                setHistoryError(err?.message ?? 'Something went wrong');
              } finally {
                setIsHistoryLoading(false);
              }
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
            display: 'flex',
            flexDirection: 'column',
            padding: 16,
            zIndex: 49
          }}
        >
          <div
            style={{
              display: 'flex',
              marginBottom: 8,
              gap: 4,
              background: 'var(--light-gray)',
              padding: 4,
              borderRadius: 6
            }}
          >
            <button
              type="button"
              className={`tab ${activeChatTab === 'chat' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setActiveChatTab('chat')}
            >
              Chat
            </button>
            <button
              type="button"
              className={`tab ${activeChatTab === 'participants' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setActiveChatTab('participants')}
            >
              Participants
            </button>
          </div>

          {activeChatTab === 'chat' ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flex: 1
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
                {chatMessages.map((m) => (
                  <div key={m.id} style={{ marginBottom: 6 }}>
                    <strong>{m.senderName}:</strong> {m.text}
                  </div>
                ))}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSendChatMessage((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ padding: '6px 10px' }}
                  onClick={() => {
                    const input = document.querySelector(
                      'input[placeholder="Type a message..."]'
                    ) as HTMLInputElement | null;
                    if (!input) return;
                    onSendChatMessage(input.value);
                    input.value = '';
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flex: 1
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Participants</div>
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
                  gap: 6
                }}
              >
                {participants
                  .filter((p) => p.role === 'student')
                  .map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--white)',
                        borderRadius: 8,
                        padding: '6px 8px'
                      }}
                    >
                      <span>{p.name ?? p.id}</span>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          background: '#ff4d4f',
                          color: '#fff',
                          border: 'none',
                          padding: '4px 10px'
                        }}
                        onClick={() => onKickParticipant(p.id)}
                      >
                        Kick out
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Poll history overlay */}
      {isHistoryOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60
          }}
          onClick={() => setIsHistoryOpen(false)}
        >
          <div
            className="card"
            style={{
              width: 'min(720px, 100% - 40px)',
              maxHeight: '70vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="card-title"
              style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}
            >
              <span>Poll History</span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setIsHistoryOpen(false)}
              >
                Close
              </button>
            </div>
            {isHistoryLoading && (
              <p className="page-subtitle">Loading previous polls...</p>
            )}
            {!isHistoryLoading && historyError && (
              <p className="page-subtitle" style={{ color: 'crimson' }}>
                {historyError}
              </p>
            )}
            {!isHistoryLoading && !historyError && historyItems.length === 0 && (
              <p className="page-subtitle">No past polls yet.</p>
            )}
            {!isHistoryLoading &&
              !historyError &&
              historyItems.map((poll, index) => {
                const total =
                  poll.options.reduce((sum, opt) => sum + opt.votes, 0) || 1;
                return (
                  <div key={poll.id} className="card" style={{ marginBottom: 16 }}>
                    <div className="card-title">Q{index + 1}</div>
                    <div className="poll-question">{poll.question}</div>
                    {poll.options.map((opt, optIndex) => {
                      const pct = Math.round((opt.votes / total) * 100);
                      const dotClass =
                        optIndex === 0
                          ? 'option-dot a'
                          : optIndex === 1
                          ? 'option-dot b'
                          : optIndex === 2
                          ? 'option-dot c'
                          : 'option-dot d';
                      return (
                        <div key={opt.label} className="result-item">
                          <div className="result-header">
                            <div className="result-label">
                              <span className={dotClass} />
                              {opt.label}
                            </div>
                            <div className="result-pct">{pct}%</div>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </main>
  );
};

export default TeacherView;

