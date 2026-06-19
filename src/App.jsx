import { useState, useEffect, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { setupWakeLockListener } from './lib/wakeLock';
import { pickRandomNumber } from './lib/random';
import Header from './components/Header';
import CurrentNumber from './components/CurrentNumber';
import ActionButtons from './components/ActionButtons';
import PreviousNumbers from './components/PreviousNumbers';
import NumberGrid from './components/NumberGrid';
import LoginModal from './components/LoginModal';


export default function App() {
  const {
    generatedNumbers,
    currentNumber,
    history,
    isOperator,
    isGameComplete,
    callNumber,
    selectNumber,
    resetGame,
    login,
    logout,
  } = useGameState();

  const [showLogin, setShowLogin] = useState(false);

  // Screen Wake Lock
  useEffect(() => {
    const cleanup = setupWakeLockListener();
    return cleanup;
  }, []);

  // Instant random generate
  const handleGenerate = useCallback(() => {
    const num = pickRandomNumber(generatedNumbers);
    if (num === null) return;
    callNumber(num);
  }, [generatedNumbers, callNumber]);

  // Instant manual select (operator)
  const handleSelect = useCallback(
    (num) => {
      selectNumber(num);
    },
    [selectNumber]
  );

  const progress = (generatedNumbers.length / 90) * 100;

  return (
    <div className="app">
      <Header
        onOpenLogin={() => setShowLogin(true)}
        isOperator={isOperator}
        onLogout={logout}
      />

      <div className="progress-bar">
        <div
          className={`progress-bar-fill${isGameComplete ? ' complete' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="main-content">
        <div className="control-panel">
          <CurrentNumber
            currentNumber={currentNumber}
            isGameComplete={isGameComplete}
            calledCount={generatedNumbers.length}
          />

          <ActionButtons
            onGenerate={handleGenerate}
            onReset={resetGame}
            isGameComplete={isGameComplete}
            isOperator={isOperator}
            generatedCount={generatedNumbers.length}
          />

          <PreviousNumbers history={history} />
        </div>

        <NumberGrid
          generatedNumbers={generatedNumbers}
          currentNumber={currentNumber}
          isOperator={isOperator}
          onSelectNumber={handleSelect}
        />
      </main>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={login}
        />
      )}
    </div>
  );
}
