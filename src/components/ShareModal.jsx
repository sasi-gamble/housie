import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

export default function ShareModal({ gameId, onClose }) {
  const [copied, setCopied] = useState(false);

  const gameUrl = `${window.location.origin}/game/${gameId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select a hidden input
      const input = document.createElement('input');
      input.value = gameUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "S'haousi — Join My Game",
          text: `Join my Housie game! Room code: ${gameId}`,
          url: gameUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Share Game Room</h2>

        <div className="share-code-display">
          <span className="share-code-label">Room Code</span>
          <span className="share-code-value">{gameId}</span>
        </div>

        <div className="share-qr">
          <QRCodeSVG
            value={gameUrl}
            size={180}
            bgColor="#ffffff"
            fgColor="#0f291e"
            level="M"
          />
        </div>

        <div className="share-actions">
          <button className="btn btn-primary" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          {navigator.share && (
            <button className="btn btn-cancel" onClick={handleNativeShare}>
              Share
            </button>
          )}
        </div>

        <button className="btn btn-cancel share-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
