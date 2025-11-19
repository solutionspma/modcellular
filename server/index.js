const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'your-anon-key'
);

// Connected users map
const connectedUsers = new Map();
const activeCalls = new Map();

// WebRTC Signaling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // User authentication
  socket.on('auth', async ({ userId, deviceId, token }) => {
    try {
      // Verify token with Supabase
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        socket.emit('auth:error', { message: 'Invalid token' });
        return;
      }

      // Store user connection
      connectedUsers.set(userId, {
        socketId: socket.id,
        userId,
        deviceId,
        connectedAt: Date.now()
      });

      socket.userId = userId;
      socket.deviceId = deviceId;

      socket.emit('auth:success', { userId });
      console.log(`User ${userId} authenticated`);

      // Update device last seen
      await supabase
        .from('devices')
        .update({ last_seen: new Date().toISOString(), is_active: true })
        .eq('device_fingerprint', deviceId);

    } catch (error) {
      console.error('Auth error:', error);
      socket.emit('auth:error', { message: 'Authentication failed' });
    }
  });

  // WebRTC Call Signaling
  socket.on('call:offer', async ({ calleeId, offer, callType }) => {
    const callerUser = connectedUsers.get(socket.userId);
    const calleeUser = connectedUsers.get(calleeId);

    if (!calleeUser) {
      socket.emit('call:error', { message: 'User not available' });
      return;
    }

    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store call in database
    const { data, error } = await supabase
      .from('calls')
      .insert({
        id: callId,
        caller: socket.userId,
        callee: calleeId,
        offer_sdp: offer,
        call_type: callType || 'audio'
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create call:', error);
      socket.emit('call:error', { message: 'Failed to initiate call' });
      return;
    }

    activeCalls.set(callId, {
      callId,
      caller: socket.userId,
      callee: calleeId,
      startedAt: Date.now()
    });

    // Send offer to callee
    io.to(calleeUser.socketId).emit('call:incoming', {
      callId,
      caller: socket.userId,
      offer,
      callType
    });
  });

  socket.on('call:answer', async ({ callId, answer }) => {
    const call = activeCalls.get(callId);
    if (!call) {
      socket.emit('call:error', { message: 'Call not found' });
      return;
    }

    // Update call with answer
    await supabase
      .from('calls')
      .update({
        answer_sdp: answer,
        answered_at: new Date().toISOString()
      })
      .eq('id', callId);

    const callerUser = connectedUsers.get(call.caller);
    if (callerUser) {
      io.to(callerUser.socketId).emit('call:answered', { callId, answer });
    }
  });

  socket.on('call:ice-candidate', ({ callId, candidate, target }) => {
    const targetUser = connectedUsers.get(target);
    if (targetUser) {
      io.to(targetUser.socketId).emit('call:ice-candidate', {
        callId,
        candidate,
        from: socket.userId
      });
    }
  });

  socket.on('call:end', async ({ callId }) => {
    const call = activeCalls.get(callId);
    if (call) {
      const duration = Math.floor((Date.now() - call.startedAt) / 1000);

      // Update call in database
      await supabase
        .from('calls')
        .update({
          ended_at: new Date().toISOString(),
          duration
        })
        .eq('id', callId);

      // Notify other party
      const otherUserId = call.caller === socket.userId ? call.callee : call.caller;
      const otherUser = connectedUsers.get(otherUserId);
      
      if (otherUser) {
        io.to(otherUser.socketId).emit('call:ended', { callId });
      }

      activeCalls.delete(callId);
    }
  });

  // Messaging
  socket.on('message:send', async ({ receiverId, content, mediaUrl, mediaType }) => {
    try {
      // Store message in database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender: socket.userId,
          receiver: receiverId,
          content,
          media_url: mediaUrl,
          media_type: mediaType,
          transport_method: 'direct'
        })
        .select()
        .single();

      if (error) throw error;

      // Notify sender
      socket.emit('message:sent', { messageId: data.id });

      // Send to receiver if online
      const receiverUser = connectedUsers.get(receiverId);
      if (receiverUser) {
        io.to(receiverUser.socketId).emit('message:received', {
          messageId: data.id,
          sender: socket.userId,
          content,
          mediaUrl,
          mediaType,
          timestamp: data.created_at
        });

        // Mark as delivered
        await supabase
          .from('messages')
          .update({
            delivered: true,
            delivered_at: new Date().toISOString()
          })
          .eq('id', data.id);
      }
    } catch (error) {
      console.error('Message send error:', error);
      socket.emit('message:error', { message: 'Failed to send message' });
    }
  });

  socket.on('message:read', async ({ messageId }) => {
    await supabase
      .from('messages')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', messageId);

    // Notify sender
    const { data } = await supabase
      .from('messages')
      .select('sender')
      .eq('id', messageId)
      .single();

    if (data) {
      const senderUser = connectedUsers.get(data.sender);
      if (senderUser) {
        io.to(senderUser.socketId).emit('message:read', { messageId });
      }
    }
  });

  // Typing indicator
  socket.on('typing:start', ({ userId }) => {
    const user = connectedUsers.get(userId);
    if (user) {
      io.to(user.socketId).emit('typing:start', { userId: socket.userId });
    }
  });

  socket.on('typing:stop', ({ userId }) => {
    const user = connectedUsers.get(userId);
    if (user) {
      io.to(user.socketId).emit('typing:stop', { userId: socket.userId });
    }
  });

  // Mesh network relay
  socket.on('mesh:relay', ({ targetDeviceId, payload }) => {
    // Find device and relay message
    for (const [userId, user] of connectedUsers.entries()) {
      if (user.deviceId === targetDeviceId) {
        io.to(user.socketId).emit('mesh:message', {
          from: socket.deviceId,
          payload
        });
        break;
      }
    }
  });

  // Disconnect
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);

    if (socket.userId) {
      connectedUsers.delete(socket.userId);

      // Update device status
      if (socket.deviceId) {
        await supabase
          .from('devices')
          .update({ is_active: false })
          .eq('device_fingerprint', socket.deviceId);
      }

      // End any active calls
      for (const [callId, call] of activeCalls.entries()) {
        if (call.caller === socket.userId || call.callee === socket.userId) {
          const otherUserId = call.caller === socket.userId ? call.callee : call.caller;
          const otherUser = connectedUsers.get(otherUserId);
          
          if (otherUser) {
            io.to(otherUser.socketId).emit('call:ended', { callId, reason: 'disconnect' });
          }

          activeCalls.delete(callId);
        }
      }
    }
  });
});

// REST API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connectedUsers: connectedUsers.size,
    activeCalls: activeCalls.size,
    uptime: process.uptime()
  });
});

// Get user status
app.get('/api/users/:userId/status', (req, res) => {
  const user = connectedUsers.get(req.params.userId);
  res.json({
    online: !!user,
    lastSeen: user?.connectedAt || null
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Mod Cellular server running on port ${PORT}`);
});

module.exports = { app, server, io };
