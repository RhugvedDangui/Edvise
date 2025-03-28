import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  menteeId: {
    type: String,
    required: true,
  },
  mentorId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'connected', 'disconnected'],
    default: 'pending'
  },
  connectedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Compound index to ensure unique connections
connectionSchema.index({ menteeId: 1, mentorId: 1 }, { unique: true });

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection;
