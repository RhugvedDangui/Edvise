import express from 'express';
import Review from '../models/reviewModel.js';

const router = express.Router();

// Add a new review
router.post('/add', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get reviews for a specific college
router.get('/college/:collegeId', async (req, res) => {
  try {
    const reviews = await Review.find({ collegeId: req.params.collegeId });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
