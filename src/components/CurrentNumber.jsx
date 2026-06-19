export default function CurrentNumber({ currentNumber, isGameComplete, calledCount }) {
  return (
    <div key={currentNumber ?? 'empty'} className="current-number-card">
      <span className="current-number-label">
        {isGameComplete ? 'Game Complete' : 'Current Number'}
      </span>
      {isGameComplete ? (
        <span className="current-number-complete">
          🎉 All numbers have been called!
        </span>
      ) : (
        <>
          <span className="current-number-value">
            {currentNumber !== null ? currentNumber : '—'}
          </span>
          <span className="current-number-counter">
            <strong>{calledCount}</strong> of 90 called
          </span>
        </>
      )}
    </div>
  );
}
