import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: function() {
      return !this.googleId && !this.githubId; // Username only required if not using Google OAuth
    },
    unique: true,
    sparse: true, // Allows null values to be non-unique
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.githubId; // Password only required if not using Google OAuth
    },
    minlength: 6
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email']
  },
  // OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values to be non-unique
  },
  githubId: {  // ADD THIS ENTIRE BLOCK
    type: String,
    unique: true,
    sparse: true
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  profilePicture: {
    type: String
  }
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);