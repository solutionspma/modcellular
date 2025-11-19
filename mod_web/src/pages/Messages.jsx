import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/Messages.css';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !recipient) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('messages').insert({
      sender_id: user?.id,
      recipient_id: recipient,
      content: newMessage,
      encrypted: true
    });

    setNewMessage('');
  };

  return (
    <div className="messages-container">
      <header>
        <h1>💬 Messages</h1>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>
      </header>

      <div className="chat-list">
        {messages.map(msg => (
          <div key={msg.id} className="message-item">
            <div className="message-content">{msg.content}</div>
            <div className="message-time">
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="message-input">
        <input
          type="text"
          placeholder="Recipient ID"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
        />
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
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
