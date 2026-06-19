import { useMemo, useEffect } from 'react';

export default function NumberGrid({
  generatedNumbers,
  currentNumber,
  isOperator,
  onSelectNumber,
}) {
  const generatedSet = useMemo(
    () => new Set(generatedNumbers),
    [generatedNumbers]
  );

  const numbers = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= 90; i++) arr.push(i);
    return arr;
  }, []);

  // Auto-scroll to current number
  useEffect(() => {
    if (currentNumber !== null) {
      const tile = document.querySelector(`[data-number="${currentNumber}"]`);
      if (tile) {
        tile.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentNumber]);

  return (
    <div className="grid-section">
      <span className="grid-label">Number Board</span>
      <div className="number-grid">
        {numbers.map((num) => {
          const isCurrent = num === currentNumber;
          const isGenerated = generatedSet.has(num);
          const isAvailable = !isGenerated;

          let className = 'grid-tile';
          if (isCurrent) {
            className += ' grid-tile-current';
          } else if (isGenerated) {
            className += ' grid-tile-generated';
          } else {
            className += ' grid-tile-available';
          }

          if (isOperator && isAvailable) {
            className += ' grid-tile-selectable';
          }

          return (
            <button
              key={num}
              data-number={num}
              className={className}
              disabled={isGenerated && !isCurrent}
              onClick={() => {
                if (isOperator && isAvailable) {
                  onSelectNumber(num);
                }
              }}
              aria-label={`Number ${num}${isGenerated ? ', called' : ''}`}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}
