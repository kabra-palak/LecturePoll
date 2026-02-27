import React, { useEffect, useState } from 'react';
import { Poll, formatSeconds } from './pollTypes';

type StudentViewProps = {
  studentName: string | null;
  setStudentName: (name: string) => void;
  activePoll: Poll | null;
  remainingSeconds: number;
  totalVotes: number;
  onSubmitVote: (optionId: string) => void;
  isKicked: boolean;
  chatMessages: {
    id: string;
    text: string;
    senderName: string;
    role: 'teacher' | 'student';
    timestamp: string;
  }[];
  onSendChatMessage: (text: string) => void;
};

const StudentView: React.FC<StudentViewProps> = ({
  studentName,
  setStudentName,
  activePoll,
  remainingSeconds,
  totalVotes,
  onSubmitVote,
  isKicked,
  chatMessages,
  onSendChatMessage
}) => {
  const [tempName, setTempName] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatTab, setActiveChatTab] = useState<'chat' | 'participants'>('chat');

  // Reset selection/submission when a new poll starts
  useEffect(() => {
    setSelectedOptionId(null);
    setHasSubmitted(false);
  }, [activePoll?.id]);

  const renderTimer = () => {
    const display = activePoll?.isActive ? formatSeconds(remainingSeconds) : '00:00';
    return (
      <div className="timer">
        <span className="timer-dot" /> {display}
      </div>
    );
  };

  if (!studentName) {
    return (
      <div className="welcome-screen">
        <div className="welcome-card">
          <h1 className="welcome-title">
            Join <strong>IntervuePoll</strong>
          </h1>
          <p className="welcome-subtitle">
            Enter your name to participate in the live classroom poll. This will be unique to
            this browser tab.
          </p>
          <div className="form-group">
            <label htmlFor="student-name">Your Name</label>
            <input
              id="student-name"
              type="text"
              placeholder="e.g. Riya Sharma"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            type="button"
            style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
            onClick={() => {
              if (tempName.trim()) {
                setStudentName(tempName.trim());
              }
            }}
          >
            Join Session
          </button>
        </div>
      </div>
    );
  }

  if (isKicked) {
    return (
      <div className="welcome-screen">
        <div className="welcome-card">
          <h1 className="welcome-title">You&apos;ve been removed</h1>
          <p className="welcome-subtitle">
            The teacher has removed you from this session. Please contact your instructor if
            you believe this was a mistake.
          </p>
        </div>
      </div>
    );
  }

  const canVote =
    !!activePoll && activePoll.isActive && remainingSeconds > 0 && !hasSubmitted;

  const handleSubmit = () => {
    if (!activePoll || !selectedOptionId || !canVote) return;
    onSubmitVote(selectedOptionId);
    setHasSubmitted(true);
  };

  return (
    <>
      <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
        <div className="card">
          <div className="card-title">
            Hello, {studentName}
            {renderTimer()}
          </div>

          {activePoll ? (
            activePoll.isActive && remainingSeconds > 0 ? (
              hasSubmitted ? (
                <>
                  <div className="page-subtitle">
                    Waiting for teacher to end this question and show results...
                  </div>
                </>
              ) : (
                <>
                  <div className="poll-question">{activePoll.question}</div>
                  <div className="participant-list">
                    {activePoll.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className="participant-item"
                        style={{
                          cursor: canVote ? 'pointer' : 'default',
                          border:
                            selectedOptionId === opt.id
                              ? '2px solid var(--primary)'
                              : 'none',
                          background:
                            selectedOptionId === opt.id
                              ? 'var(--primary-bg)'
                              : 'var(--light-gray)'
                        }}
                        onClick={() => {
                          if (!canVote) return;
                          setSelectedOptionId(opt.id);
                        }}
                      >
                        <span className="participant-name">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    className="btn btn-primary"
                    type="button"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                    disabled={!canVote || !selectedOptionId}
                    onClick={handleSubmit}
                  >
                    Submit Answer
                  </button>
                </>
              )
            ) : (
              <>
                <div className="page-subtitle">
                  Time is up! Here are the results:
                </div>
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
                          {opt.isCorrect && (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: 'var(--success)'
                              }}
                            >
                              Correct
                            </span>
                          )}
                        </div>
                        <div className="result-pct">{pct}%</div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </>
            )
          ) : (
            <>
              <div className="page-subtitle">
                Waiting for the teacher to start a poll.
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating chat icon and panel, mirroring the teacher view */}
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
            width: 380,
            maxHeight: 340,
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
                  gap: 4
                }}
              >
                <div>You</div>
                <div>Rahul Bajaj</div>
                <div>Purbashree Bagchi</div>
                <div>Raji Ghosh</div>
                <div>Rakesh Sharma</div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default StudentView;

