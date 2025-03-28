import express from 'express';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

// Create or update user profile
router.post('/profile', async (req, res) => {
  try {
    const {
      clerkId,
      email,
      username,
      role,
      location,
      education,
      experience,
      qualifications,
      specialization,
      bio,
      skills,
      socialLinks
    } = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { clerkId },
      {
        clerkId,
        email,
        username,
        role,
        location,
        education,
        experience,
        qualifications,
        specialization,
        bio,
        skills,
        socialLinks
      },
      { new: true, upsert: true }
    );

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({ error: 'Failed to create/update profile' });
  }
});

// Get user profile by clerkId
router.get('/profile/:clerkId', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ clerkId: req.params.clerkId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get all mentors
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await UserProfile.find({ role: 'mentor' });
    res.status(200).json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

export default router;
