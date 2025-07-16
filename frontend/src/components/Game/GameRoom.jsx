import React, { useState, useEffect, useCallback } from 'react';
import ShogiBoard from '../Board/ShogiBoard';
import { apiService } from '../../services/api';
import './GameRoom.css';

const GameRoom = ({ gameId, userId, onMove, onLeaveGame }) => {
  const [gameState, setGameState] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const playerRole = gameState?.players.sente.id === userId ? 'sente' : 'gote';

  useEffect(() => {
    // Load game state from API
    const loadGameState = async () => {
      try {
        setLoading(true);
        
        // Get game data from API
        const gameResult = await apiService.getGame(gameId);
        if (gameResult.error) {
          setError('ゲームの読み込みに失敗しました');
          return;
        }
        
        const gameData = gameResult.data;
        
        // Get initial board if no board state exists
        let boardState = gameData.board;
        if (!boardState || boardState.length === 0) {
          const boardResult = await apiService.getInitialBoard();
          if (boardResult.data) {
            boardState = boardResult.data.board;
          }
        }
        
        const gameStateData = {
          id: gameData.id,
          players: {
            sente: { id: gameData.players.sente, name: gameData.players.sente, rating: 1500 },
            gote: { id: gameData.players.gote, name: gameData.players.gote, rating: 1450 },
          },
          currentPlayer: gameData.currentPlayer || 'sente',
          board: boardState || [
            ['l', 'n', 's', 'g', 'k', 'g', 's', 'n', 'l'],
            ['', 'r', '', '', '', '', '', 'b', ''],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['', 'B', '', '', '', '', '', 'R', ''],
            ['L', 'N', 'S', 'G', 'K', 'G', 'S', 'N', 'L'],
          ],
          moves: gameData.moves || [],
          status: gameData.status || 'active',
          timeRemaining: {
            sente: 600,
            gote: 600,
          },
        };

        setGameState(gameStateData);
        setIsMyTurn(gameStateData.currentPlayer === playerRole);
      } catch (err) {
        console.error('Error loading game state:', err);
        setError('ゲームの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadGameState();
  }, [gameId, userId, playerRole]);

  const handleMove = useCallback(
    async (move) => {
      if (!isMyTurn || !gameState) return;

      try {
        // 手の検証と適用
        const validateResult = await apiService.validateMove(gameState.board, move, gameState.currentPlayer);
        if (validateResult.error || !validateResult.data?.isValid) {
          console.error('Invalid move:', validateResult.error);
          return;
        }

        // 盤面に手を適用
        const moveResult = await apiService.applyShogiMove(gameState.board, move, gameState.currentPlayer);
        if (moveResult.error) {
          console.error('Failed to apply move:', moveResult.error);
          return;
        }

        // ローカル状態を更新
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            board: moveResult.data.newBoard,
            currentPlayer: prev.currentPlayer === 'sente' ? 'gote' : 'sente',
            moves: [...prev.moves, move],
          };
        });

        setIsMyTurn(false);
        
        // バックエンドに手を送信
        onMove(move);
      } catch (error) {
        console.error('Error handling move:', error);
      }
    },
    [isMyTurn, gameState, onMove]
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPlayerInfo = (player, role) => {
    const timeRemaining = gameState?.timeRemaining?.[role] || 0;
    const isCurrentPlayer = gameState?.currentPlayer === role;

    return (
      <div className={`player-info ${role} ${isCurrentPlayer ? 'active' : ''}`}>
        <div className="player-name">{player.name}</div>
        <div className="player-rating">レート: {player.rating}</div>
        <div className="player-time">残り時間: {formatTime(timeRemaining)}</div>
      </div>
    );
  };

  const renderGameControls = () => {
    return (
      <div className="game-controls">
        <button className="leave-button" onClick={onLeaveGame}>
          ゲームを離れる
        </button>
        <button className="resign-button" disabled={!isMyTurn}>
          投了
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="game-room loading">
        <div className="loading-spinner">ゲームを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-room error">
        <div className="error-message">{error}</div>
        <button onClick={onLeaveGame}>戻る</button>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="game-room error">
        <div className="error-message">ゲームが見つかりません</div>
        <button onClick={onLeaveGame}>戻る</button>
      </div>
    );
  }

  return (
    <div className="game-room">
      <div className="game-header">
        <h2>将棋対局</h2>
        <div className="game-status">
          {gameState.status === 'active' && (
            <span className={`turn-indicator ${gameState.currentPlayer}`}>
              {gameState.currentPlayer === 'sente' ? '先手' : '後手'}の番
            </span>
          )}
        </div>
      </div>

      <div className="game-layout">
        <div className="players-section">
          {renderPlayerInfo(gameState.players.gote, 'gote')}
          <div className="game-board-section">
            <ShogiBoard
              boardState={gameState.board}
              currentPlayer={gameState.currentPlayer}
              onMove={handleMove}
              disabled={!isMyTurn || gameState.status !== 'active'}
            />
          </div>
          {renderPlayerInfo(gameState.players.sente, 'sente')}
        </div>

        <div className="game-sidebar">
          <div className="moves-history">
            <h3>指手履歴</h3>
            <div className="moves-list">
              {gameState.moves.map((move, index) => (
                <div key={index} className="move-item">
                  {index + 1}. {move.notation || `${move.from} → ${move.to}`}
                </div>
              ))}
            </div>
          </div>

          {renderGameControls()}
        </div>
      </div>
    </div>
  );
};

export default GameRoom;