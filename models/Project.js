const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    // Tags (Stored as an array of strings)
    tags: {
        type: [String],
        required: true,
    },

    // Project Category (e.g., Fullstack, Landing, Frontend)
    category: {
        type: String,
        enum: ['Fullstack', 'Frontend', 'Backend', 'Landing', 'UI/UX', 'Other'],
        required: true,
        default: 'Fullstack', // You can change this default as needed
    },

    // Full Description
    description: {
        type: String,
        required: true,
    },

    // Image URL
    imageUrl: {
        type: String,
        required: true,
    },

    imagePublicId: { 
        type: String, 
        default: null,
    },

    liveUrl: {
        type: String,
        trim: true,
        default: "https://google.com",
    },

    repoUrl: {
        type: String,
        trim: true,
        default: "https://google.com",
    },

    // Reference to the admin/user who created this project
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true, // Automatically adds createdAt & updatedAt
});

module.exports = mongoose.model('Project', projectSchema);
