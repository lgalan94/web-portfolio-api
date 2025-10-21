const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Sender's Name (e.g., "Jane Doe", "John Smith", "Sam Wilson")
  senderName: {
    type: String,
    required: true,
    trim: true,
  },
  // Sender's Email (useful for replies, not shown in UI but crucial for contact)
  senderEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  // Subject of the message (e.g., "Hiring Inquiry", "Collaboration Opportunity")
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  // Main body/content of the message
  messageBody: { // Renamed from 'message' to avoid conflict with Mongoose 'message' property in errors
    type: String,
    required: true,
  },
  // Date the message was received (e.g., "7/20/2024")
  receivedAt: {
    type: Date,
    default: Date.now,
  },
  // Status of the message (e.g., 'unread', 'read', 'archived', 'deleted')
  status: {
    type: String,
    enum: ['unread', 'read', 'archived', 'deleted'],
    default: 'unread',
  },
  
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Message', messageSchema);