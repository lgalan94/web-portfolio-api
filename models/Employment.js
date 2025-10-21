const mongoose = require('mongoose');

const employmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true, // Prevents duplicate job titles
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: 'Remote',
    trim: true
  },
  startDate: {
    type: String,
    required: true,
    trim: true
  },
  endDate: {
    type: String,
    default: 'Present',
    trim: true
  },
  description: {
    type: [String], // Array of bullet points or tasks
    required: true
  },
  createdOn: {
    type: Date,
    default: () => new Date()
  }
});

// 🧠 Pre-save hook: capitalize first letter of each word in title & company
employmentSchema.pre('save', function (next) {
  const capitalizeWords = (text) =>
    text
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  if (this.title) this.title = capitalizeWords(this.title);
  if (this.company) this.company = capitalizeWords(this.company);

  next();
});

const Employment = mongoose.model('Employment', employmentSchema);

module.exports = Employment;
