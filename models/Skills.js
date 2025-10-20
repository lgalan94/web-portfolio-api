const mongoose = require('mongoose');

const skillsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  icon: {
    type: String,
    required: false,
    default: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'
  },
  category: {
    type: String,
    required: true,
    default: 'other'
  },
  createdOn: {
    type: Date,
    default: () => new Date()
  }
});

const Skills = mongoose.model('Skill', skillsSchema);

module.exports = Skills;
