import { useState } from 'react';

export default function ActionButtons({
  onGenerate,
  onReset,
  isGameComplete,
  isOperator,
  generatedCount,
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    setShowConfirm(true);
  };

  const confirmReset = () => {
    setShowConfirm(false);
    onReset();
  };

  const cancelReset = () => {
    setShowConfirm(false);
  };

  // In operator mode, random generate still works alongside manual selection
  const generateDisabled = isGameComplete;

  return (
    <div className="action-buttons">
      <button
        className="btn btn-primary"
        onClick={onGenerate}
        disabled={generateDisabled}
      >
        {isGameComplete ? 'All Numbers Called' : 'Generate Next Number'}
      </button>
      <button
        className="btn btn-danger-outline"
        onClick={handleReset}
        disabled={generatedCount === 0}
      >
        Reset Game
      </button>

      {showConfirm && (
        <div className="confirm-overlay" onClick={cancelReset}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="confirm-text">Reset the current game?</p>
            <div className="confirm-actions">
              <button className="btn btn-cancel" onClick={cancelReset}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
