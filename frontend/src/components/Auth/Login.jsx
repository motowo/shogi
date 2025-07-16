import React, { useState } from 'react';
import './Auth.css';

const Login = ({ onLogin, onSwitchToRegister, loading = false, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>ログイン</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="パスワードを入力してください"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading || !email || !password}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            アカウントをお持ちでない方は{' '}
            <button
              type="button"
              className="switch-button"
              onClick={onSwitchToRegister}
              disabled={loading}
            >
              新規登録
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;