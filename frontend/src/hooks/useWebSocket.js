import { useState, useEffect, useCallback } from 'react';
import { websocketService } from '../services/websocket';

export const useWebSocket = (userId, userName) => {
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId && userName) {
      websocketService.connect(userId, userName);
    } else {
      websocketService.disconnect();
    }

    const handleConnected = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    const handleConnectionError = (error) => {
      setError(error.message || 'Connection error');
    };

    const handleGameUpdated = (updatedGameState) => {
      setGameState(updatedGameState);
    };

    const handleError = (error) => {
      setError(error.message || 'Unknown error');
    };

    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('connection_error', handleConnectionError);
    websocketService.on('game_updated', handleGameUpdated);
    websocketService.on('error', handleError);

    return () => {
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.off('connection_error', handleConnectionError);
      websocketService.off('game_updated', handleGameUpdated);
      websocketService.off('error', handleError);
    };
  }, [userId, userName]);

  const joinGame = useCallback((gameId) => {
    websocketService.joinGame(gameId);
  }, []);

  const leaveGame = useCallback((gameId) => {
    websocketService.leaveGame(gameId);
  }, []);

  const makeMove = useCallback((gameId, move) => {
    websocketService.makeMove(gameId, move);
  }, []);

  const sendChatMessage = useCallback((gameId, message) => {
    websocketService.sendChatMessage(gameId, message);
  }, []);

  const resignGame = useCallback((gameId) => {
    websocketService.resignGame(gameId);
  }, []);

  return {
    isConnected,
    gameState,
    error,
    joinGame,
    leaveGame,
    makeMove,
    sendChatMessage,
    resignGame,
  };
};