export default function ConnectionStatus({ status }) {
  // Only show when NOT connected — hide when synced to reduce clutter
  if (status === 'connected') return null;

  const label = status === 'reconnecting' ? 'Reconnecting...' : 'Offline';
  const className = `connection-status connection-${status}`;

  return (
    <div className={className}>
      <span className="connection-dot" />
      <span className="connection-label">{label}</span>
    </div>
  );
}
