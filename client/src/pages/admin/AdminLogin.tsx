import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok && data.user.role === 'admin') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', data.user.name);
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid admin credentials');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage('Password reset instructions have been sent to your email.');
    setTimeout(() => {
      setShowForgotPassword(false);
      setResetMessage('');
      setResetEmail('');
    }, 3000);
  };

  if (showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Reset Password</h1>
          <p>Enter your email address to receive password reset instructions.</p>
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
            {resetMessage && <div className="success-message">{resetMessage}</div>}
            <button type="submit" className="btn-modern btn-primary-modern">
              Send Reset Instructions
            </button>
            <button 
              type="button" 
              onClick={() => setShowForgotPassword(false)}
              className="btn-modern btn-secondary-modern"
            >
              Back to Login
            </button>
          </form>
          <div className="login-links">
            <Link to="/" className="home-link">← Back to Homepage</Link>
          </div>
          <footer className="login-footer">
            <p>&copy; 2024 Islamic Prayer Tools. All rights reserved.</p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Admin Email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="btn-modern btn-primary-modern">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button 
            type="button" 
            onClick={() => setShowForgotPassword(true)}
            className="forgot-password-link"
          >
            Forgot Password?
          </button>
        </form>
        <div className="login-links">
          <Link to="/" className="home-link">← Back to Homepage</Link>
        </div>
        <footer className="login-footer">
          <p>&copy; 2024 Islamic Prayer Tools. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLogin;