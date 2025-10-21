const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const userSchema = new Schema({
  // 🔹 Basic Authentication Fields
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: { // Hashed password
    type: String,
    required: true,
  },
  isAdmin: { // Used for authorization logic
    type: Boolean,
    default: true,
  },

  // 🔹 Profile Fields (from settingSchema)
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true,
  },
  bio: {
    type: String,
    required: true,
  },
  shortBio: {
    type: String, 
    required: true
  },
  profilePictureUrl: {
    type: String,
    default: 'https://via.placeholder.com/150',
  },
  profilePictureUrlPublicId: {
    type: String,
    default: null
  },
  socialLinks: {
    github: {
      type: String,
      trim: true,
      default: null,
    },
    linkedin: {
      type: String,
      trim: true,
      default: null,
    },
    facebook: {
      type: String,
      trim: true,
      default: null,
    },
    gitlab: {
      type: String,
      trim: true,
      default: null,
    },
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});


// --- 🔐 Password Hashing Middleware ---
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


// --- 🔑 Password Verification Method ---
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', userSchema);
