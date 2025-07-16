import React, { useState } from 'react';
import './GameMenu.css';

const GameMenu = ({
  onStartGame,
  onViewHistory,
  onViewLeaderboard,
  onLogout,
  user,
}) => {
  const [showAiOptions, setShowAiOptions] = useState(false);

  const handleAiGameStart = (difficulty) => {
    onStartGame('ai', difficulty);
    setShowAiOptions(false);
  };

  const winRate = user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) : 0;

  return (
    <div className="game-menu">
      <div className="menu-header">
        <h1>将棋オンライン</h1>
        <div className="user-info">
          <div className="user-name">{user.displayName}</div>
          <div className="user-stats">
            <span>レート: {user.rating}</span>
            <span>対局数: {user.gamesPlayed}</span>
            <span>勝率: {winRate}%</span>
          </div>
        </div>
      </div>

      <div className="menu-content">
        <div className="game-options">
          <div className="option-card">
            <h3>対戦相手を選択</h3>

            <div className="game-buttons">
              <button
                className="game-button ai-game"
                onClick={() => setShowAiOptions(!showAiOptions)}
              >
                AI対戦
                <span className="button-subtitle">コンピューターと対戦</span>
              </button>

              {showAiOptions && (
                <div className="ai-options">
                  <button
                    className="difficulty-button easy"
                    onClick={() => handleAiGameStart('easy')}
                  >
                    初級
                  </button>
                  <button
                    className="difficulty-button medium"
                    onClick={() => handleAiGameStart('medium')}
                  >
                    中級
                  </button>
                  <button
                    className="difficulty-button hard"
                    onClick={() => handleAiGameStart('hard')}
                  >
                    上級
                  </button>
                  <button
                    className="difficulty-button expert"
                    onClick={() => handleAiGameStart('expert')}
                  >
                    上級者
                  </button>
                </div>
              )}

              <button className="game-button human-game" onClick={() => onStartGame('human')}>
                オンライン対戦
                <span className="button-subtitle">他のプレイヤーと対戦</span>
              </button>
            </div>
          </div>

          <div className="option-card">
            <h3>メニュー</h3>

            <div className="menu-buttons">
              <button className="menu-button" onClick={onViewHistory}>
                対局履歴
              </button>

              <button className="menu-button" onClick={onViewLeaderboard}>
                ランキング
              </button>

              <button className="menu-button logout" onClick={onLogout}>
                ログアウト
              </button>
            </div>
          </div>
        </div>

        <div className="menu-sidebar">
          <div className="recent-games">
            <h4>最近の対局</h4>
            <div className="game-list">
              <div className="game-item">
                <div className="game-opponent">AI (中級)</div>
                <div className="game-result win">勝利</div>
                <div className="game-date">2024-01-15</div>
              </div>
              <div className="game-item">
                <div className="game-opponent">プレイヤー123</div>
                <div className="game-result loss">敗北</div>
                <div className="game-date">2024-01-14</div>
              </div>
              <div className="game-item">
                <div className="game-opponent">AI (上級)</div>
                <div className="game-result draw">引き分け</div>
                <div className="game-date">2024-01-13</div>
              </div>
            </div>
          </div>

          <div className="tips">
            <h4>今日のヒント</h4>
            <div className="tip-content">
              序盤は中央の制压が重要です。飛車と角の活用を意識しましょう。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;