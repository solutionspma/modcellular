import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Messages from './pages/Messages';
import Dialer from './pages/Dialer';
import Wallet from './pages/Wallet';
import Settings from './pages/Settings';
import DeviceControl from './pages/DeviceControl';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#000',
        color: '#00FF87',
        fontSize: '1.5em'
      }}>
        Loading Mod Cellular...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={session ? <Navigate to="/messages" /> : <Login />} 
        />
        <Route 
          path="/messages" 
          element={session ? <Messages /> : <Navigate to="/" />} 
        />
        <Route 
          path="/dialer" 
          element={session ? <Dialer /> : <Navigate to="/" />} 
        />
        <Route 
          path="/wallet" 
          element={session ? <Wallet /> : <Navigate to="/" />} 
        />
        <Route 
          path="/settings" 
          element={session ? <Settings /> : <Navigate to="/" />} 
        />
        <Route 
          path="/device-control" 
          element={session ? <DeviceControl /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
