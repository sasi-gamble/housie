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
import FlyingNumber from './components/FlyingNumber';

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
  const [flyingNum, setFlyingNum] = useState(null);

  // Screen Wake Lock
  useEffect(() => {
    const cleanup = setupWakeLockListener();
    return cleanup;
  }, []);

  // Trigger flying animation from a grid tile to the current number card
  const triggerFly = useCallback((num) => {
    const tile = document.querySelector(`[data-number="${num}"]`);
    const card = document.querySelector('.current-number-card');
    if (tile && card) {
      setFlyingNum({
        number: num,
        from: tile.getBoundingClientRect(),
        to: card.getBoundingClientRect(),
      });
    }
  }, []);

  // Animated random generate
  const handleGenerate = useCallback(() => {
    const num = pickRandomNumber(generatedNumbers);
    if (num === null) return;
    triggerFly(num);
    callNumber(num);
  }, [generatedNumbers, triggerFly, callNumber]);

  // Animated manual select (operator)
  const handleSelect = useCallback(
    (num) => {
      triggerFly(num);
      selectNumber(num);
    },
    [triggerFly, selectNumber]
  );

  const progress = (generatedNumbers.length / 100) * 100;

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

        <NumberGrid
          generatedNumbers={generatedNumbers}
          currentNumber={currentNumber}
          isOperator={isOperator}
          onSelectNumber={handleSelect}
        />
      </main>

      {flyingNum && (
        <FlyingNumber
          number={flyingNum.number}
          fromRect={flyingNum.from}
          toRect={flyingNum.to}
          onComplete={() => setFlyingNum(null)}
        />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={login}
        />
      )}
    </div>
  );
}
