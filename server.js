const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

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
    origin: "*", // Allow connections from any origin
    methods: ["GET", "POST"]
  }
});

// Keep track of connected users
let users = [];

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Wait for the user to provide their username
  socket.on('set_username', (username) => {
    // Add user to the list with the provided name
    const user = {
      id: socket.id,
      name: username,
      online: true
    };
    
    users.push(user);
    
    // Broadcast the updated users list to everyone
    io.emit('users_update', users);
    
    // Send the user their own info
    socket.emit('user_info', user);
      // Notify others that a new user has joined
    socket.broadcast.emit('new_message', {
      id: Date.now(),
      text: `${username} has joined the chat`,
      sender: 'system',
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle new messages
  socket.on('send_message', (messageData) => {
    console.log('Message received:', messageData);
    // Broadcast the message to the recipient or to everyone
    if (messageData.to) {
      // Direct message to a specific user
      io.to(messageData.to).emit('new_message', messageData);
      // Also send back to the sender
      socket.emit('new_message', messageData);
    } else {
      // Broadcast to everyone
      io.emit('new_message', messageData);
    }
  });
  
  // Handle typing events
  socket.on('typing', (typingData) => {
    const { userId, userName, to } = typingData;
    
    if (to) {
      // Send typing notification only to the recipient
      io.to(to).emit('user_typing', { userId, userName, to });
    } else {
      // Broadcast typing to everyone except sender
      socket.broadcast.emit('user_typing', { userId, userName, to: null });
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Find the user who disconnected
    const disconnectedUser = users.find(u => u.id === socket.id);
    
    // Remove user from the list
    users = users.filter(u => u.id !== socket.id);
    
    // Broadcast updated users list
    io.emit('users_update', users);
    
    // Notify others that a user has left (if the user had set a username)
    if (disconnectedUser) {
      io.emit('new_message', {
        id: Date.now(),
        text: `${disconnectedUser.name} has left the chat`,
        sender: 'system',
        timestamp: new Date().toISOString()
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
