import { supabase } from '../lib/supabase';
import { useState } from 'react';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Single app domain - always redirect to /messages on same origin
      const redirectTo = `${window.location.origin}/messages`;
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: { emailRedirectTo: redirectTo }
      });
      
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Check your email for the magic link!');
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🌐 Mod Cellular</h1>
        <p className="tagline">Decentralized. Unstoppable. Yours.</p>
        
        <div className="form">
          <input 
            type="email"
            placeholder="Enter your email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleLogin()}
            disabled={loading}
          />
          <button onClick={handleLogin} disabled={loading || !email}>
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </div>
        
        {message && <p className="message">{message}</p>}
        
        <div className="features">
          <div className="feature">✅ Call Any Phone Number</div>
          <div className="feature">✅ E2E Encrypted Messaging</div>
          <div className="feature">✅ Mesh Network Relay</div>
          <div className="feature">✅ MODX Token Wallet</div>
        </div>
      </div>
    </div>
  );
}
