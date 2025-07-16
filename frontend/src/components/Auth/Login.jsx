import React, { useState } from 'react';
import './Auth.css';

const Login = ({ onLogin, loading = false, error }) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onLogin(name);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>プレイヤー名を入力</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">プレイヤー名</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="プレイヤー名を入力してください"
              maxLength={20}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading || !name.trim()}>
            {loading ? '参加中...' : '将棋を始める'}
          </button>
        </form>

        <div className="auth-info">
          <p>※ テスト用の簡易認証です</p>
          <p>※ 将来的にはOAuth認証を実装予定</p>
        </div>
      </div>
    </div>
  );
};

export default Login;