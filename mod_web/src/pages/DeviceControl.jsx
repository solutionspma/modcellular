import { useState, useEffect } from 'react';
import { deviceGateway } from '../lib/deviceGateway';
import '../styles/DeviceControl.css';

export default function DeviceControl() {
  const [devices, setDevices] = useState(null);
  const [sim, setSim] = useState(null);
  const [apn, setApn] = useState('');
  const [shellCmd, setShellCmd] = useState('');
  const [shellOutput, setShellOutput] = useState('');
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fetchDevices = async () => {
    setLoading('devices');
    setError(null);
    try {
      const { data } = await deviceGateway.getDevices();
      setDevices(data);
    } catch (e) {
      setError(e.message || 'Gateway unreachable. Is it running on your Mac Mini?');
      setDevices(null);
    } finally {
      setLoading(null);
    }
  };

  const fetchSim = async () => {
    setLoading('sim');
    setError(null);
    try {
      const { data } = await deviceGateway.getSim();
      setSim(data);
    } catch (e) {
      setError(e.message);
      setSim(null);
    } finally {
      setLoading(null);
    }
  };

  const handleSetApn = async () => {
    if (!apn.trim()) return;
    setLoading('apn');
    setError(null);
    try {
      await deviceGateway.setApn(apn.trim());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleRestartRadio = async () => {
    setLoading('radio');
    setError(null);
    try {
      await deviceGateway.restartRadio();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleReboot = async () => {
    if (!confirm('Reboot the connected device?')) return;
    setLoading('reboot');
    setError(null);
    try {
      await deviceGateway.reboot();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleShell = async () => {
    if (!shellCmd.trim()) return;
    setLoading('shell');
    setError(null);
    setShellOutput('');
    try {
      const { data } = await deviceGateway.shell(shellCmd.trim());
      setShellOutput(data || '(no output)');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="device-control-container">
      <header>
        <h1>📱 Device Control</h1>
        <p className="subtitle">Mac Mini gateway — phone via USB/ADB</p>
      </header>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="device-section">
        <h2>Connected Devices</h2>
        <div className="section-actions">
          <button
            className="btn-primary"
            onClick={fetchDevices}
            disabled={loading === 'devices'}
          >
            {loading === 'devices' ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <pre className="output-block">{devices ?? '—'}</pre>
      </div>

      <div className="device-section">
        <h2>SIM / Telephony</h2>
        <div className="section-actions">
          <button
            className="btn-primary"
            onClick={fetchSim}
            disabled={loading === 'sim'}
          >
            {loading === 'sim' ? 'Loading…' : 'Fetch SIM'}
          </button>
        </div>
        <pre className="output-block output-scroll">{sim ?? '—'}</pre>
      </div>

      <div className="device-section">
        <h2>APN</h2>
        <div className="apn-row">
          <input
            type="text"
            placeholder="e.g. wholesale"
            value={apn}
            onChange={e => setApn(e.target.value)}
          />
          <button
            className="btn-primary"
            onClick={handleSetApn}
            disabled={loading === 'apn' || !apn.trim()}
          >
            {loading === 'apn' ? 'Setting…' : 'Set APN'}
          </button>
        </div>
      </div>

      <div className="device-section">
        <h2>Radio & Reboot</h2>
        <div className="action-row">
          <button
            className="btn-secondary"
            onClick={handleRestartRadio}
            disabled={loading === 'radio'}
          >
            {loading === 'radio' ? '…' : 'Restart Radio'}
          </button>
          <button
            className="btn-danger"
            onClick={handleReboot}
            disabled={loading === 'reboot'}
          >
            {loading === 'reboot' ? '…' : 'Reboot Device'}
          </button>
        </div>
      </div>

      <div className="device-section">
        <h2>Shell</h2>
        <div className="shell-row">
          <input
            type="text"
            placeholder="adb shell command"
            value={shellCmd}
            onChange={e => setShellCmd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleShell()}
          />
          <button
            className="btn-primary"
            onClick={handleShell}
            disabled={loading === 'shell' || !shellCmd.trim()}
          >
            {loading === 'shell' ? '…' : 'Run'}
          </button>
        </div>
        {shellOutput && (
          <pre className="output-block output-scroll">{shellOutput}</pre>
        )}
      </div>

      <nav className="bottom-nav">
        <a href="/messages">💬 Messages</a>
        <a href="/dialer">📞 Dialer</a>
        <a href="/wallet">💰 Wallet</a>
        <a href="/device-control">📱 Device</a>
        <a href="/settings">⚙️ Settings</a>
      </nav>
    </div>
  );
}
