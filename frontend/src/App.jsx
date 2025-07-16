import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useWebSocket } from './hooks/useWebSocket';
import Login from './components/Auth/Login';
import GameMenu from './components/Menu/GameMenu';
import GameRoom from './components/Game/GameRoom';
import { apiService } from './services/api';
import './App.css';

const App = () => {
  const { user, isAuthenticated, loading, login, logout } = useAuth();
  const { isConnected } = useWebSocket(user?.id, user?.name);

  const [appState, setAppState] = useState('login');
  const [currentGameId, setCurrentGameId] = useState(null);
  const [authError, setAuthError] = useState(null);

  const handleLogin = async (name) => {
    setAuthError(null);
    const result = await login(name);

    if (result.success) {
      setAppState('menu');
    } else {
      setAuthError(result.error || 'ログインに失敗しました');
    }
  };

  const handleLogout = async () => {
    await logout();
    setAppState('login');
    setCurrentGameId(null);
    setAuthError(null);
  };

  const handleStartGame = async (gameType, difficulty) => {
    try {
      if (gameType === 'ai') {
        // Start AI game
        const result = await apiService.createGame('ai');
        if (result.data) {
          setCurrentGameId(result.data.id);
          setAppState('game');
        }
      } else {
        // Start human game (matchmaking)
        const result = await apiService.createGame('human');
        if (result.data) {
          setCurrentGameId(result.data.id);
          setAppState('game');
        }
      }
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const handleMove = async (move) => {
    if (!currentGameId) return;

    try {
      const result = await apiService.makeMove(currentGameId, move);
      if (!result.data) {
        console.error('Move failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to make move:', error);
    }
  };

  const handleLeaveGame = () => {
    setCurrentGameId(null);
    setAppState('menu');
  };

  const handleViewHistory = () => {
    // TODO: Implement game history view
    console.log('View history');
  };

  const handleViewLeaderboard = () => {
    // TODO: Implement leaderboard view
    console.log('View leaderboard');
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="App">
        <Login
          onLogin={handleLogin}
          loading={loading}
          error={authError}
        />
      </div>
    );
  }

  return (
    <div className="App">
      <div className="connection-status">
        {isConnected ? (
          <span className="status-connected">オンライン</span>
        ) : (
          <span className="status-disconnected">オフライン</span>
        )}
      </div>

      {appState === 'menu' && user && (
        <GameMenu
          onStartGame={handleStartGame}
          onViewHistory={handleViewHistory}
          onViewLeaderboard={handleViewLeaderboard}
          onLogout={handleLogout}
          user={{
            displayName: user.name,
            rating: user.rating || 1000,
            gamesPlayed: user.gamesPlayed || 0,
            wins: user.wins || 0,
            losses: user.losses || 0,
          }}
        />
      )}

      {appState === 'game' && currentGameId && user && (
        <GameRoom
          gameId={currentGameId}
          userId={user.id}
          onMove={handleMove}
          onLeaveGame={handleLeaveGame}
        />
      )}
    </div>
  );
};

export default App;