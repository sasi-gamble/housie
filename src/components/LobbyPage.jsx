import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, checkRoomExists } from '../hooks/useRoomManager';

export default function LobbyPage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleCreate = async () => {
    setError('');
    setCreating(true);
    try {
      const code = await createRoom();
      if (code) {
        navigate(`/game/${code}`);
      } else {
        setError('Failed to create room. Please try again.');
      }
    } catch {
      setError('Failed to create room. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    const code = joinCode.toUpperCase().trim();
    if (!code) {
      setError('Please enter a room code.');
      return;
    }
    setJoining(true);
    try {
      const exists = await checkRoomExists(code);
      if (exists) {
        navigate(`/game/${code}`);
      } else {
        setError('Room not found. Check the code and try again.');
      }
    } catch {
      setError('Failed to join room. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="lobby">
      <div className="lobby-header">
        <h1 className="lobby-title">S'haousi</h1>
        <p className="lobby-subtitle">Housie / Tambola Number Caller</p>
      </div>

      <div className="lobby-card">
        <h2 className="lobby-card-title">Create a Game</h2>
        <p className="lobby-card-desc">
          Start a new game room and share the code with your friends.
        </p>
        <button
          className="btn btn-primary lobby-btn"
          onClick={handleCreate}
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Create Room'}
        </button>
      </div>

      <div className="lobby-divider">
        <span>or</span>
      </div>

      <div className="lobby-card">
        <h2 className="lobby-card-title">Join a Game</h2>
        <p className="lobby-card-desc">
          Enter the room code shared by the game host.
        </p>
        <form onSubmit={handleJoin} className="lobby-join-form">
          <input
            type="text"
            className="form-input lobby-code-input"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            maxLength={4}
            autoComplete="off"
            autoCapitalize="characters"
          />
          <button
            type="submit"
            className="btn btn-primary lobby-btn"
            disabled={joining || !joinCode.trim()}
          >
            {joining ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </div>

      {error && <p className="lobby-error">{error}</p>}
    </div>
  );
}
