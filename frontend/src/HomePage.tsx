import React from 'react';
import { Persona } from './pollTypes';

type HomePageProps = {
  selectedPersona: Persona | null;
  onSelectPersona: (persona: Persona) => void;
  onContinue: () => void;
};

const HomePage: React.FC<HomePageProps> = ({
  selectedPersona,
  onSelectPersona,
  onContinue
}) => {
  const hasSelection = !!selectedPersona;

  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <h1 className="welcome-title">
          Welcome to the <strong>Live Polling System</strong>
        </h1>
        <p className="welcome-subtitle">
        Please select the role that best describes you to begin using the live polling
        svstem
        </p>

        <div className="role-cards">
          <button
            type="button"
            className={`role-card ${selectedPersona === 'teacher' ? 'selected' : ''}`}
            onClick={() => onSelectPersona('teacher')}
          >
            <h4>I&apos;m a Teacher</h4>
            <p>Create polls, track live results, and view poll history for your class.</p>
          </button>
          <button
            type="button"
            className={`role-card ${selectedPersona === 'student' ? 'selected' : ''}`}
            onClick={() => onSelectPersona('student')}
          >
            <h4>I&apos;m a Student</h4>
            <p>Join the session, answer questions in real time, and see how the class votes.</p>
          </button>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{
            marginTop: 24,
            width: '100%',
            justifyContent: 'center',
            opacity: hasSelection ? 1 : 0.6,
            cursor: hasSelection ? 'pointer' : 'not-allowed'
          }}
          onClick={() => {
            if (!hasSelection) return;
            onContinue();
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default HomePage;

