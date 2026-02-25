import { supabase } from '../lib/supabase';
import { useState } from 'react';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Account created. Sign in below.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMessage(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Mod Cellular</h1>
        <p className="tagline">Decentralized. Unstoppable. Yours.</p>

        <div className="form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSubmit()}
            disabled={loading}
          />
          <button onClick={handleSubmit} disabled={loading || !email || !password}>
            {loading ? '...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </div>

        <button
          type="button"
          className="toggle-mode"
          onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
        >
          {isSignUp ? 'Already have an account? Sign in' : 'New? Create account'}
        </button>

        {message && <p className="message">{message}</p>}

        <div className="features">
          <div className="feature">Call Any Phone Number</div>
          <div className="feature">E2E Encrypted Messaging</div>
          <div className="feature">Mesh Network Relay</div>
          <div className="feature">MODX Token Wallet</div>
        </div>
      </div>
    </div>
  );
}
