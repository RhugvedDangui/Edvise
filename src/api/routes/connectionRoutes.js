import express from 'express';
import Connection from '../models/Connection.js';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

// Get suggested mentors based on skills
router.get('/suggested-mentors/:userId', async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ clerkId: req.params.userId });
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Find mentors with matching skills
    const suggestedMentors = await UserProfile.find({
      role: 'mentor',
      clerkId: { $ne: req.params.userId }, // Exclude the current user
      skills: { $in: userProfile.skills }
    });

    // Get existing connections for the user
    const connections = await Connection.find({
      menteeId: req.params.userId
    });

    // Add connection status to mentor data
    const mentorsWithStatus = suggestedMentors.map(mentor => {
      const connection = connections.find(c => c.mentorId === mentor.clerkId);
      return {
        ...mentor.toObject(),
        connectionStatus: connection ? connection.status : null
      };
    });

    res.json(mentorsWithStatus);
  } catch (error) {
    console.error('Error fetching suggested mentors:', error);
    res.status(500).json({ message: 'Error fetching suggested mentors' });
  }
});

// Search mentors
router.get('/search-mentors', async (req, res) => {
  try {
    const { query, userId } = req.query;
    const searchRegex = new RegExp(query, 'i');

    const mentors = await UserProfile.find({
      role: 'mentor',
      clerkId: { $ne: userId },
      $or: [
        { username: searchRegex },
        { skills: searchRegex }
      ]
    });

    // Get existing connections for the user
    const connections = await Connection.find({
      menteeId: userId
    });

    // Add connection status to search results
    const mentorsWithStatus = mentors.map(mentor => {
      const connection = connections.find(c => c.mentorId === mentor.clerkId);
      return {
        ...mentor.toObject(),
        connectionStatus: connection ? connection.status : null
      };
    });

    res.json(mentorsWithStatus);
  } catch (error) {
    console.error('Error searching mentors:', error);
    res.status(500).json({ message: 'Error searching mentors' });
  }
});

// Create or update connection
router.post('/connect', async (req, res) => {
  try {
    const { menteeId, mentorId } = req.body;

    const existingConnection = await Connection.findOne({
      menteeId,
      mentorId
    });

    if (existingConnection) {
      if (existingConnection.status === 'connected') {
        return res.status(400).json({ message: 'Already connected' });
      }
      existingConnection.status = 'connected';
      existingConnection.connectedAt = new Date();
      await existingConnection.save();
      return res.json({ message: 'Connection updated' });
    }

    const connection = new Connection({
      menteeId,
      mentorId,
      status: 'connected',
      connectedAt: new Date()
    });

    await connection.save();
    res.status(201).json({ message: 'Connected successfully' });
  } catch (error) {
    console.error('Error connecting:', error);
    res.status(500).json({ message: 'Error connecting with mentor' });
  }
});

// Disconnect
router.post('/disconnect', async (req, res) => {
  try {
    const { menteeId, mentorId } = req.body;
    const connection = await Connection.findOneAndUpdate(
      { menteeId, mentorId },
      { status: 'disconnected', connectedAt: null },
      { new: true }
    );

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    res.json({ message: 'Disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting:', error);
    res.status(500).json({ message: 'Error disconnecting from mentor' });
  }
});

// Get connected mentors
router.get('/connected-mentors/:userId', async (req, res) => {
  try {
    const connections = await Connection.find({
      menteeId: req.params.userId,
      status: 'connected'
    });

    const mentorIds = connections.map(conn => conn.mentorId);
    const mentorProfiles = await UserProfile.find({
      clerkId: { $in: mentorIds }
    });

    res.json(mentorProfiles);
  } catch (error) {
    console.error('Error fetching connected mentors:', error);
    res.status(500).json({ message: 'Error fetching connected mentors' });
  }
});

// Get connected mentees
router.get('/connected-mentees/:userId', async (req, res) => {
  try {
    const connections = await Connection.find({
      mentorId: req.params.userId,
      status: 'connected'
    });

    const menteeIds = connections.map(conn => conn.menteeId);
    const menteeProfiles = await UserProfile.find({
      clerkId: { $in: menteeIds }
    });

    res.json(menteeProfiles);
  } catch (error) {
    console.error('Error fetching connected mentees:', error);
    res.status(500).json({ message: 'Error fetching connected mentees' });
  }
});

export default router;
