import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/Settings.css';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [meshEnabled, setMeshEnabled] = useState(true);
  const [relayStats, setRelayStats] = useState({ data: 0, earnings: 0 });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser);

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser?.id)
      .single();

    if (profile) {
      setPhoneNumber(profile.phone_number || 'Not Assigned');
      setMeshEnabled(profile.mesh_relay_enabled || false);
    }

    // Fetch relay stats
    const { data: stats } = await supabase
      .from('relay_stats')
      .select('*')
      .eq('user_id', authUser?.id)
      .single();

    if (stats) {
      setRelayStats({
        data: stats.total_data_gb || 0,
        earnings: stats.total_earnings || 0
      });
    }
  };

  const toggleMeshRelay = async () => {
    const newValue = !meshEnabled;
    setMeshEnabled(newValue);

    await supabase
      .from('profiles')
      .update({ mesh_relay_enabled: newValue })
      .eq('id', user?.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="settings-container">
      <header>
        <h1>⚙️ Settings</h1>
      </header>

      <div className="settings-section">
        <h2>Account</h2>
        <div className="setting-item">
          <label>Email</label>
          <div className="setting-value">{user?.email}</div>
        </div>
        <div className="setting-item">
          <label>Phone Number</label>
          <div className="setting-value">{phoneNumber}</div>
          <button className="link-button">Port Number</button>
        </div>
        <div className="setting-item">
          <label>Subscription</label>
          <div className="setting-value">Premium - $9.99/mo</div>
          <button className="link-button">Manage</button>
        </div>
      </div>

      <div className="settings-section">
        <h2>Mesh Network</h2>
        <div className="setting-item">
          <label>Mesh Relay</label>
          <div className="toggle-container">
            <input 
              type="checkbox" 
              checked={meshEnabled}
              onChange={toggleMeshRelay}
              id="mesh-toggle"
            />
            <label htmlFor="mesh-toggle" className="toggle-label">
              {meshEnabled ? 'Enabled' : 'Disabled'}
            </label>
          </div>
        </div>
        <div className="stats-card">
          <div className="stat">
            <div className="stat-label">Data Relayed</div>
            <div className="stat-value">{relayStats.data.toFixed(2)} GB</div>
          </div>
          <div className="stat">
            <div className="stat-label">Earnings</div>
            <div className="stat-value">{relayStats.earnings} MODX</div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Privacy</h2>
        <div className="setting-item">
          <label>E2E Encryption</label>
          <div className="setting-value">✅ Always On</div>
        </div>
        <div className="setting-item">
          <label>Metadata Protection</label>
          <div className="setting-value">✅ Onion Routing</div>
        </div>
        <div className="setting-item">
          <label>Spam Filtering</label>
          <button className="link-button">Configure</button>
        </div>
      </div>

      <div className="settings-section">
        <h2>Emergency</h2>
        <div className="setting-item">
          <label>E911 Address</label>
          <button className="link-button important">⚠️ Set Address</button>
        </div>
        <div className="info-box">
          ⚠️ You must register your physical address for 911 services to work correctly.
        </div>
      </div>

      <div className="settings-section">
        <h2>About</h2>
        <div className="setting-item">
          <label>Version</label>
          <div className="setting-value">1.0.0 (Beta)</div>
        </div>
        <div className="setting-item">
          <label>Build</label>
          <div className="setting-value">Pack J Complete</div>
        </div>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

      <nav className="bottom-nav">
        <a href="/messages">💬 Messages</a>
        <a href="/dialer">📞 Dialer</a>
        <a href="/wallet">💰 Wallet</a>
        <a href="/settings">⚙️ Settings</a>
      </nav>
    </div>
  );
}
