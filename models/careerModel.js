const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
    en: {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        responsibilities: String,
        requirements: String,
        benefits: String,
    },
    fr: {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        responsibilities: String,
        requirements: String,
        benefits: String,
    },
    category: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    // enabled: {
    //     type: Boolean,
    //     default: true
    // },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = new mongoose.model('Career', careerSchema);