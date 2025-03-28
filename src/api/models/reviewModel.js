import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  collegeId: {
    type: String,
    required: true
  },
  collegeName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['curriculum', 'faculty', 'internships', 'placements']
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
