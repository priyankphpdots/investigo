const mongoose = require('mongoose');

// project schema
const projectSchema = mongoose.Schema({
    en: {
        title: {
            type: String,
            required: [true, 'English title is required'],
        },
        description: {
            type: String,
            required: [true, 'English description is required'],
        },
        reasons: {
            type: String,
            required: [true, 'English reasons are required'],
        },
    },
    fr: {
        title: {
            type: String,
            required: [true, 'French title is required'],
        },
        description: {
            type: String,
            required: [true, 'French description is required'],
        },
        reasons: {
            type: String,
            required: [true, 'French reasons are required'],
        },
    },
    category: {
        type: String,
        required: [true, 'Catogory is required'],
    },
    property: {
        type: String,
        required: [true, 'Property type is required'],
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
    },
    invested: {
        type: Number,
        default: 100000,
    },
    investors: {
        type: Number,
        default: 0,
    },
    monthlyReturn: {
        type: String,
        required: [true, 'Monthly return is required'],
    },
    image: {
        type: String,
        required: [true, 'Image is required'],
    },
    icon: {
        type: String,
        required: [true, 'Icon is required'],
    },
    gallery: [String],
    // city: {
    //     type: String,
    //     required: [true, 'City is required'],
    // },
    location: {
        type: String,
        required: [true, 'Location is required'],
    },
    url: {
        type: String,
        required: [true, 'Map url is required'],
    },
    // coordinates: {
    //     lat: String,
    //     lng: String
    // },
    finished: {
        type: Boolean,
        default: false,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports = new mongoose.model("Project", projectSchema);
