export default function PreviousNumbers({ history }) {
  if (history.length === 0) return null;

  return (
    <div className="previous-section">
      <span className="previous-label">Previous</span>
      <div className="previous-chips">
        {history.map((num, i) => (
          <span key={`${num}-${i}`} className="previous-chip">
            {num}
          </span>
        ))}
      </div>
    </div>
  );
}
