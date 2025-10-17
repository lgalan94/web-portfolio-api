const mongoose = require('mongoose');
const { Schema } = mongoose; // Destructuring Schema for cleaner code

const projectSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    // Tags (Stored as an array of strings, converted from the comma-separated input)
    tags: {
        type: [String],
        required: true, 
    },
    // Full Description (Required)
    description: {
        type: String,
        required: true,
    },
    // Image URL (The 'https://picsum.photos/600/400' field)
    imageUrl: {
        type: String,
        required: true,
    },
    imagePublicId: { 
        type: String, 
        default: null  
    },        
    liveUrl: {
        type: String,
        trim: true,
        default: null,
    },
    // Optional Repository URL
    repoUrl: {
        type: String,
        trim: true,
        default: null,
    },
    // 💡 NEW: Link this project to the admin user who created it
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the 'User' model (your admin)
        required: true,
    },
}, {
    // 💡 Simplification: Using Mongoose built-in timestamps is cleaner
    // and automatically handles createdAt and updatedAt fields.
    timestamps: true 
});

// If you choose to use the standard `{ timestamps: true }` option, 
// you can remove the manual `createdAt` and `updatedAt` fields from the schema definition above.

module.exports = mongoose.model('Project', projectSchema);