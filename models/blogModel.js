const mongoose = require('mongoose');

// blog schema
const blogSchema = mongoose.Schema({
    en: {
        title: {
            type: String,
            required: [true, "English title is required."],
        },
        description: {
            type: String,
            required: [true, "English description is required."],
        },
        content: {
            type: String,
            required: [true, "English content is required."],
        },
    },
    fr: {
        title: {
            type: String,
            required: [true, "French title is required."],
        },
        description: {
            type: String,
            required: [true, "French description is required."],
        },
        content: {
            type: String,
            required: [true, "French content is required."],
        },
    },
    category: {
        type: String,
        required: [true, "Category is required."]
    },
    image: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'Admin',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Blog', blogSchema);