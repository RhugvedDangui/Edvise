import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['mentor', 'mentee'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  education: {
    type: String,
    required: true
  },
  // Additional fields for mentors
  experience: {
    type: String,
    required: function() { return this.role === 'mentor'; }
  },
  qualifications: {
    type: [String],
    required: function() { return this.role === 'mentor'; }
  },
  specialization: {
    type: [String],
    required: function() { return this.role === 'mentor'; }
  },
  // Common fields
  bio: {
    type: String,
    required: false
  },
  skills: {
    type: [String],
    default: []
  },
  socialLinks: {
    linkedin: String,
    github: String,
    website: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

export default UserProfile;
