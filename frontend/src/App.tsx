import React from 'react';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>将棋アプリ</h1>
        <p>ブラウザで将棋を指そう</p>
      </header>
      <main>
        <div className="game-board">
          {/* 将棋盤コンポーネントはここに実装予定 */}
          <p>将棋盤（実装予定）</p>
        </div>
      </main>
    </div>
  );
};

export default App;
