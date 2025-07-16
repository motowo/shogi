import React, { useState } from 'react';
import './Auth.css';

const Register = ({
  onRegister,
  onSwitchToLogin,
  loading = false,
  error,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  const validateForm = () => {
    const errors = [];

    if (!email) {
      errors.push('メールアドレスを入力してください');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push('有効なメールアドレスを入力してください');
    }

    if (!password) {
      errors.push('パスワードを入力してください');
    } else if (password.length < 6) {
      errors.push('パスワードは6文字以上で入力してください');
    }

    if (password !== confirmPassword) {
      errors.push('パスワードが一致しません');
    }

    if (!displayName) {
      errors.push('表示名を入力してください');
    } else if (displayName.length < 2) {
      errors.push('表示名は2文字以上で入力してください');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onRegister(email, password, displayName);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>新規登録</h2>

        {error && <div className="error-message">{error}</div>}

        {validationErrors.length > 0 && (
          <div className="error-message">
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="displayName">表示名</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={loading}
              placeholder="表示名を入力してください"
            />
          </div>

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
              placeholder="6文字以上のパスワード"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">パスワード確認</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="パスワードを再入力してください"
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || !email || !password || !confirmPassword || !displayName}
          >
            {loading ? '登録中...' : '新規登録'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            既にアカウントをお持ちの方は{' '}
            <button
              type="button"
              className="switch-button"
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              ログイン
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;