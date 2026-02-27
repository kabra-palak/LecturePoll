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
  teacherTab,
  setTeacherTab,
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
      <div style={{ maxWidth: 960, margin: '32px auto 0', padding: '0 40px 100px' }}>
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            marginBottom: 28
          }}
        >
          <div>
            {/* Purple pill badge */}
            <div className="teacher-header-badge">✦ Intervue Poll</div>

            <h1 className="page-title" style={{ marginBottom: 6 }}>
            {teacherTab === 'create' && (
  <>
    Let's <strong>Get Started</strong>
  </>
)}
            </h1>
            <p className="page-subtitle" style={{ maxWidth: 640 }}>
              you&apos;ll have the ability to create and manage polls, ask questions and
              monitor your students reponses in real-time.
            </p>
          </div>

          {/* View Poll History button */}
          <button
            type="button"
            title="View poll history"
            style={{
              borderRadius: '999px',
              border: 'none',
              background: 'var(--primary)',
              padding: '6px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.8rem',
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(119, 101, 218, 0.35)',
              flexShrink: 0,
              marginTop: 4
            }}
            onClick={async () => {
              try {
                setIsHistoryOpen(true);
                setIsHistoryLoading(true);
                setHistoryError(null);
                const res = await fetch('https://lecturepoll-1.onrender.com/api/polls/history');
                if (!res.ok) throw new Error('Failed to load history');
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
                background: 'var(--primary-dark)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 11a4 4 0 110-8 4 4 0 010 8z"
                  fill="#ffffff"
                />
                <circle cx="12" cy="12" r="2" fill="#ffffff" />
              </svg>
            </span>
            <span>View Poll History</span>
          </button>
        </div>

        {/* ── CREATE TAB ── */}
        {teacherTab === 'create' && (
          <>
            {/* Question input section */}
            <div className="question-form">
              {/* Row: label + duration select */}
              <div className="question-form-header">
                <span className="question-form-header-label">Enter your question</span>
                <select
                  id="question-duration"
                  className="duration-select"
                  value={durationSeconds}
                  onChange={(e) => onDurationChange(Number(e.target.value))}
                >
                  <option value={30}>30 seconds</option>
                  <option value={45}>45 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={90}>90 seconds</option>
                </select>
              </div>

              {/* Large textarea-style input */}
              <input
                id="question-input"
                type="text"
                className="question-textarea"
                placeholder="Type your question here..."
                value={questionText}
                onChange={(e) => onQuestionTextChange(e.target.value)}
              />
            </div>

            {/* Options section */}
            <div className="form-group" style={{ marginTop: 24, marginBottom: 0 }}>
              {/* Two-column header */}
              <div className="options-header">
                <span className="options-header-label">Edit Options</span>
                <span className="options-header-label">Is it Correct?</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {options.map((opt, index) => (
                  <div key={opt.id} className="option-row">
                    {/* Purple number badge */}
                    <div className="option-index">{index + 1}</div>

                    {/* Text input */}
                    <input
                      type="text"
                      className="option-input"
                      placeholder={`Option ${index + 1}`}
                      value={opt.label}
                      onChange={(e) => onOptionLabelChange(opt.id, e.target.value)}
                    />

                    {/* Yes / No radios */}
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`correct-${opt.id}`}
                          checked={!!opt.isCorrect}
                          onChange={() => onSetCorrect(opt.id, true)}
                        />
                        Yes
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`correct-${opt.id}`}
                          checked={!opt.isCorrect}
                          onChange={() => onSetCorrect(opt.id, false)}
                        />
                        No
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="add-option"
                type="button"
                onClick={onAddOption}
              >
                + Add More option
              </button>
            </div>
          </>
        )}

        {/* ── LIVE RESULTS TAB ── */}
        {teacherTab === 'live' && (
          <div style={{ marginTop: 16 }}>
            {activePoll && (
              <div className="card poll-results-card">
                <div className="poll-question">{activePoll.question}</div>

                {activePoll.options.map((opt, index) => {
                  const pct = totalVotes
                    ? Math.round((opt.votes / totalVotes) * 100)
                    : 0;

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
                        <div
                          className="progress-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      {/* ── STICKY BOTTOM ACTION BAR ── */}
      <div className="teacher-footer">
        {teacherTab === 'create' ? (
          <button
            className="btn btn-primary btn-ask"
            type="button"
            onClick={() => {
              onAskQuestion();
              setTeacherTab('live');
            }}
            disabled={!canAskNewQuestion}
          >
            Ask Question
          </button>
        ) : (
          <button
            className="btn btn-primary btn-ask"
            type="button"
            onClick={() => {
              if (!canAskNewQuestion) return;
              onAddQuestion();
              setTeacherTab('create');
            }}
            disabled={!canAskNewQuestion}
          >
            Ask Next Question
          </button>
        )}
      </div>

      {/* ── Floating chat icon ── */}
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

      {/* ── Chat panel ── */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
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

      {/* Close main content container */}
      </div>

      {/* ── Poll history overlay ── */}
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
                        optIndex === 0 ? 'option-dot a'
                        : optIndex === 1 ? 'option-dot b'
                        : optIndex === 2 ? 'option-dot c'
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
