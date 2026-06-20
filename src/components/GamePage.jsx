import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameSync } from '../hooks/useGameSync';
import { setupWakeLockListener } from '../lib/wakeLock';
import Header from './Header';
import CurrentNumber from './CurrentNumber';
import ActionButtons from './ActionButtons';
import PreviousNumbers from './PreviousNumbers';
import NumberGrid from './NumberGrid';
import LoginModal from './LoginModal';
import ShareModal from './ShareModal';
import ConnectionStatus from './ConnectionStatus';

export default function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const {
    currentNumber,
    calledNumbers,
    queuedNumber,
    history,
    isOperator,
    isGameComplete,
    connectionStatus,
    generateNext,
    selectNumber,
    resetGame,
    claimOperator,
    logout,
  } = useGameSync(gameId);

  const [showLogin, setShowLogin] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Screen Wake Lock
  useEffect(() => {
    const cleanup = setupWakeLockListener();
    return cleanup;
  }, []);

  const handleGenerate = useCallback(() => {
    generateNext();
  }, [generateNext]);

  const handleSelect = useCallback(
    (num) => {
      selectNumber(num);
    },
    [selectNumber]
  );

  const handleLogin = useCallback(
    async (password) => {
      if (password === 'sas') {
        const success = await claimOperator();
        return success;
      }
      return false;
    },
    [claimOperator]
  );

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const progress = (calledNumbers.length / 90) * 100;

  return (
    <div className="app">
      <Header
        onOpenLogin={() => setShowLogin(true)}
        isOperator={isOperator}
        onLogout={handleLogout}
        gameId={gameId}
        onShare={() => setShowShare(true)}
        onBack={handleBack}
      />

      <div className="progress-bar">
        <div
          className={`progress-bar-fill${isGameComplete ? ' complete' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <ConnectionStatus status={connectionStatus} />

      <main className="main-content">
        <div className="control-panel">
          <CurrentNumber
            currentNumber={currentNumber}
            isGameComplete={isGameComplete}
            calledCount={calledNumbers.length}
          />

          <ActionButtons
            onGenerate={handleGenerate}
            onReset={resetGame}
            isGameComplete={isGameComplete}
            isOperator={isOperator}
            generatedCount={calledNumbers.length}
          />

          <PreviousNumbers history={history} />
        </div>

        <NumberGrid
          generatedNumbers={calledNumbers}
          currentNumber={currentNumber}
          queuedNumber={queuedNumber}
          isOperator={isOperator}
          onSelectNumber={handleSelect}
        />
      </main>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
        />
      )}

      {showShare && (
        <ShareModal
          gameId={gameId}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
