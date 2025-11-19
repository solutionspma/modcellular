import { useState, useRef } from 'react';
import { createTelnyxClient, makeCall } from '../lib/telnyx';
import '../styles/Dialer.css';

export default function Dialer() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState('idle'); // idle, ringing, active, ended
  const [duration, setDuration] = useState(0);
  const clientRef = useRef(null);
  const callRef = useRef(null);

  const handleDigit = (digit) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber(phoneNumber + digit);
    }
  };

  const handleCall = async () => {
    if (!phoneNumber) return;

    try {
      setCallStatus('ringing');
      
      // Initialize Telnyx client (would use real token from backend)
      if (!clientRef.current) {
        clientRef.current = createTelnyxClient('YOUR_LOGIN_TOKEN');
      }

      // Make the call
      const call = makeCall(clientRef.current, phoneNumber);
      callRef.current = call;

      call.on('ringing', () => setCallStatus('ringing'));
      call.on('active', () => {
        setCallStatus('active');
        startTimer();
      });
      call.on('hangup', () => {
        setCallStatus('ended');
        setTimeout(() => setCallStatus('idle'), 2000);
      });

    } catch (error) {
      console.error('Call failed:', error);
      setCallStatus('idle');
    }
  };

  const handleHangup = () => {
    if (callRef.current) {
      callRef.current.hangup();
    }
    setCallStatus('idle');
    setDuration(0);
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dialer-container">
      <header>
        <h1>📞 Dialer</h1>
      </header>

      <div className="display">
        <input 
          type="tel" 
          value={phoneNumber} 
          onChange={e => setPhoneNumber(e.target.value)}
          placeholder="Enter number"
          readOnly={callStatus !== 'idle'}
        />
        {callStatus === 'active' && (
          <div className="call-timer">{formatTime(duration)}</div>
        )}
        {callStatus === 'ringing' && (
          <div className="call-status">Calling...</div>
        )}
      </div>

      <div className="keypad">
        <div className="keypad-row">
          <button onClick={() => handleDigit('1')}>1</button>
          <button onClick={() => handleDigit('2')}>2<span>ABC</span></button>
          <button onClick={() => handleDigit('3')}>3<span>DEF</span></button>
        </div>
        <div className="keypad-row">
          <button onClick={() => handleDigit('4')}>4<span>GHI</span></button>
          <button onClick={() => handleDigit('5')}>5<span>JKL</span></button>
          <button onClick={() => handleDigit('6')}>6<span>MNO</span></button>
        </div>
        <div className="keypad-row">
          <button onClick={() => handleDigit('7')}>7<span>PQRS</span></button>
          <button onClick={() => handleDigit('8')}>8<span>TUV</span></button>
          <button onClick={() => handleDigit('9')}>9<span>WXYZ</span></button>
        </div>
        <div className="keypad-row">
          <button onClick={() => handleDigit('*')}>*</button>
          <button onClick={() => handleDigit('0')}>0<span>+</span></button>
          <button onClick={() => handleDigit('#')}>#</button>
        </div>
      </div>

      <div className="call-actions">
        <button 
          className="backspace"
          onClick={() => setPhoneNumber(phoneNumber.slice(0, -1))}
          disabled={callStatus !== 'idle'}
        >
          ⌫
        </button>
        
        {callStatus === 'idle' ? (
          <button className="call-button" onClick={handleCall}>
            📞 Call
          </button>
        ) : (
          <button className="hangup-button" onClick={handleHangup}>
            📵 Hang Up
          </button>
        )}
      </div>

      <nav className="bottom-nav">
        <a href="/messages">💬 Messages</a>
        <a href="/dialer">📞 Dialer</a>
        <a href="/wallet">💰 Wallet</a>
        <a href="/settings">⚙️ Settings</a>
      </nav>
    </div>
  );
}
