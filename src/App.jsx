import { Routes, Route, Navigate } from 'react-router-dom';
import LobbyPage from './components/LobbyPage';
import GamePage from './components/GamePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LobbyPage />} />
      <Route path="/game/:gameId" element={<GamePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
