const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store rooms and their messages
const rooms = new Map();
const roomMessages = new Map();
const userSockets = new Map(); // Track user's socket IDs

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('createRoom', (data) => {
    const { roomId, userId, username, email, imageUrl } = data;
    console.log('Creating/joining room:', roomId, 'for user:', username);

    // Store user's socket ID
    userSockets.set(userId, socket.id);

    // Leave any previous rooms
    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    // Join the new room
    socket.join(roomId);

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
      roomMessages.set(roomId, []);
    }

    // Add user to room
    const roomUsers = rooms.get(roomId);
    const userData = {
      socketId: socket.id,
      userId,
      username,
      email,
      imageUrl
    };
    roomUsers.add(userData);

    console.log(`User ${username} joined room ${roomId}`);
    console.log('Room users:', Array.from(roomUsers));
    
    socket.emit('roomCreated', { success: true, roomId });
    io.to(roomId).emit('allUsers', Array.from(roomUsers));
  });

  socket.on('getMessages', ({ roomId }) => {
    console.log('Getting messages for room:', roomId);
    const messages = roomMessages.get(roomId) || [];
    socket.emit('previousMessages', { messages });
  });

  socket.on('chatMessage', (messageData) => {
    const { roomId, senderId, senderName, message, senderRole } = messageData;
    console.log('Received message in room:', roomId);
    console.log('Message data:', messageData);
    
    // Add timestamp server-side to ensure consistency
    const messageWithTimestamp = {
      ...messageData,
      timestamp: new Date().toISOString()
    };
    
    // Store message
    if (!roomMessages.has(roomId)) {
      roomMessages.set(roomId, []);
    }
    roomMessages.get(roomId).push(messageWithTimestamp);
    
    // Get all sockets in the room
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room) {
      console.log('Room exists, broadcasting message');
      io.to(roomId).emit('chatMessage', messageWithTimestamp);
    } else {
      console.log('Room not found:', roomId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Clean up user socket mapping
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }

    // Clean up rooms
    rooms.forEach((users, roomId) => {
      const user = Array.from(users).find(u => u.socketId === socket.id);
      if (user) {
        users.delete(user);
        io.to(roomId).emit('allUsers', Array.from(users));
        io.to(roomId).emit('userLeft', { 
          userId: user.userId, 
          username: user.username 
        });
        
        if (users.size === 0) {
          rooms.delete(roomId);
          roomMessages.delete(roomId);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Chat server listening on port ${PORT}`);
});