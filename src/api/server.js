import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import roadmapRoutes from './routes/roadmapRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increase payload limit

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Request Body Size:', JSON.stringify(req.body).length, 'bytes');
  }
  next();
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    // Try local MongoDB first
    let uri = 'mongodb://127.0.0.1:27017/edvise';
    
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
    } catch (localError) {
      console.log('Local MongoDB connection failed, trying fallback...');
      // Fallback to MongoDB Atlas if local fails
      uri = process.env.MONGODB_URI || 'mongodb+srv://your_username:your_password@your_cluster.mongodb.net/edvise';
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
    }

    console.log('Successfully connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    console.log('\nPlease ensure either:');
    console.log('1. MongoDB is running locally');
    console.log('2. MongoDB Atlas connection string is set in .env file');
    process.exit(1);
  }
};

// MongoDB event handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    code: err.code
  });
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Routes
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    name: err.name,
    code: err.code
  });

  if (err instanceof SyntaxError && err.status === 413) {
    return res.status(413).json({
      error: 'Request entity too large',
      message: 'The data you are trying to send is too large'
    });
  }

  if (err instanceof mongoose.Error) {
    return res.status(500).json({
      error: 'Database error',
      message: err.message,
      type: err.name,
      details: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err : undefined
    }
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();