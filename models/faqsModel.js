const mongoose = require("mongoose");

const faqsSchema = new mongoose.Schema({
    en: {
        question: {
            type: String,
            required: [true, "English question is required."],
        },
        answer: {
            type: String,
            required: [true, "English answer is required."],
        },
    },
    fr: {
        question: {
            type: String,
            required: [true, "French question is required."],
        },
        answer: {
            type: String,
            required: [true, "French answer is required."],
        },
    },
    category: {
        type: String,
        required: [true, "Category is required."],
    },
});

module.exports = new mongoose.model("FAQs", faqsSchema);
