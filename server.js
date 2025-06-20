const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Add new features requirements
const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Keep track of connected users with enhanced status
let users = [];
let reactions = new Map(); // Store message reactions

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Enhanced user status handling
  socket.on('set_username', (userData) => {
    const { username, avatar, status, customStatus } = userData;
    const user = {
      id: socket.id,
      name: username,
      avatar: avatar || 'default-avatar.png',
      online: true,
      status: status || 'online',
      customStatus: customStatus || '',
      lastActive: new Date().toISOString()
    };
    
    users.push(user);
    io.emit('users_update', users);
    socket.emit('user_info', user);
    
    // Enhanced join message with custom animation
    socket.broadcast.emit('new_message', {
      id: Date.now(),
      text: `${username} has joined the chat`,
      sender: 'system',
      timestamp: new Date().toISOString(),
      effect: 'sparkle' // Special effect for join messages
    });
  });

  // Handle message reactions
  socket.on('add_reaction', ({ messageId, reaction, userId }) => {
    if (!reactions.has(messageId)) {
      reactions.set(messageId, new Map());
    }
    const messageReactions = reactions.get(messageId);
    messageReactions.set(userId, reaction);
    
    io.emit('reaction_update', {
      messageId,
      reactions: Array.from(messageReactions.entries())
    });
  });

  // Handle voice messages
  socket.on('voice_message', (data) => {
    const { audioBlob, to } = data;
    const message = {
      id: Date.now(),
      type: 'voice',
      sender: socket.id,
      audioBlob,
      timestamp: new Date().toISOString()
    };
    
    if (to) {
      io.to(to).emit('new_voice_message', message);
      socket.emit('new_voice_message', message);
    } else {
      io.emit('new_voice_message', message);
    }
  });

  // Handle message translation
  socket.on('translate_message', async ({ messageId, text, targetLang }) => {
    try {
      const [translation] = await translate.translate(text, targetLang);
      socket.emit('translation_result', {
        messageId,
        translation,
        targetLang
      });
    } catch (error) {
      console.error('Translation error:', error);
    }
  });

  // Handle message effects
  socket.on('send_message', (messageData) => {
    const enhancedMessage = {
      ...messageData,
      effect: messageData.effect || null,
      reactions: [],
      translated: false
    };

    if (messageData.to) {
      io.to(messageData.to).emit('new_message', enhancedMessage);
      socket.emit('new_message', enhancedMessage);
    } else {
      io.emit('new_message', enhancedMessage);
    }
  });

  // Handle user status updates
  socket.on('update_status', ({ status, customStatus }) => {
    const userIndex = users.findIndex(u => u.id === socket.id);
    if (userIndex !== -1) {
      users[userIndex].status = status;
      users[userIndex].customStatus = customStatus;
      users[userIndex].lastActive = new Date().toISOString();
      io.emit('users_update', users);
    }
  });

  // Enhanced typing indicator with status
  socket.on('typing', (typingData) => {
    const { userId, userName, to } = typingData;
    const user = users.find(u => u.id === userId);
    const typingInfo = {
      userId,
      userName,
      avatar: user?.avatar,
      status: user?.status,
      to
    };
    
    if (to) {
      io.to(to).emit('user_typing', typingInfo);
    } else {
      socket.broadcast.emit('user_typing', typingInfo);
    }
  });

  // Handle disconnect with enhanced status
  socket.on('disconnect', () => {
    const disconnectedUser = users.find(u => u.id === socket.id);
    users = users.filter(u => u.id !== socket.id);
    io.emit('users_update', users);
    
    if (disconnectedUser) {
      io.emit('new_message', {
        id: Date.now(),
        text: `${disconnectedUser.name} has left the chat`,
        sender: 'system',
        timestamp: new Date().toISOString(),
        effect: 'fade' // Special effect for leave messages
      });
    }
  });
});

const PORT = process.env.PORT || 7777;
// Listen on all network interfaces (0.0.0.0) to allow connections from other computers
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`To connect from other computers on your network, use http://<your-ip-address>:${PORT}`);
});
