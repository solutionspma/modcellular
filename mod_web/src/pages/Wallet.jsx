import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/Wallet.css';

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch user's wallet from database
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (wallet) {
      setBalance(wallet.modx_balance || 0);
      setAddress(wallet.wallet_address || 'Not Set');
    }

    // Fetch recent transactions
    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (txs) setTransactions(txs);
  };

  return (
    <div className="wallet-container">
      <header>
        <h1>💰 Wallet</h1>
      </header>

      <div className="balance-card">
        <div className="balance-label">MODX Balance</div>
        <div className="balance-amount">{balance.toLocaleString()}</div>
        <div className="balance-usd">≈ ${(balance * 0.05).toFixed(2)} USD</div>
      </div>

      <div className="wallet-address">
        <label>Your Address</label>
        <div className="address">{address}</div>
        <button onClick={() => navigator.clipboard.writeText(address)}>
          📋 Copy
        </button>
      </div>

      <div className="actions">
        <button className="action-btn">📤 Send</button>
        <button className="action-btn">📥 Receive</button>
        <button className="action-btn">🔄 Swap</button>
      </div>

      <div className="transactions">
        <h2>Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="empty">No transactions yet</p>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className="transaction-item">
              <div className="tx-type">
                {tx.type === 'reward' ? '🎁' : tx.type === 'send' ? '📤' : '📥'}
              </div>
              <div className="tx-details">
                <div className="tx-description">{tx.description}</div>
                <div className="tx-date">
                  {new Date(tx.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} MODX
              </div>
            </div>
          ))
        )}
      </div>

      <div className="earn-section">
        <h3>🚀 Earn MODX Tokens</h3>
        <div className="earn-methods">
          <div className="earn-card">
            <div className="earn-icon">📡</div>
            <div className="earn-title">Relay Data</div>
            <div className="earn-reward">50 MODX per GB</div>
          </div>
          <div className="earn-card">
            <div className="earn-icon">👥</div>
            <div className="earn-title">Refer Friends</div>
            <div className="earn-reward">100 MODX each</div>
          </div>
          <div className="earn-card">
            <div className="earn-icon">⚡</div>
            <div className="earn-title">Stake Tokens</div>
            <div className="earn-reward">12% APY</div>
          </div>
        </div>
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
