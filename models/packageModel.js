const mongoose = require('mongoose');

const packageSchema = mongoose.Schema({
    en: {
        title: {
            type: String,
            required: [true, 'English title is required'],
        },
        description: {
            type: String,
            required: [true, 'English description is required'],
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
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
    },
    dailyReturn: {
        type: Number,
        required: [true, 'Daily return is required']
    },
    monthlyReturn: {
        type: Number,
        required: [true, 'Monthly return is required']
    },
    annualReturn: {
        type: Number,
        required: [true, 'Annual return is required']
    },
    term: {
        type: Number,
        required: [true, 'Term is required']
    },
    image: {
        type: String,
        required: [true, 'Image is required'],
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports = new mongoose.model("Package", packageSchema);
