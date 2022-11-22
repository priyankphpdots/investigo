const mongoose = require('mongoose');

// page schema
const pageSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        unique: true,
    },
    en: { content: String },
    fr: { content: String },
});

module.exports = new mongoose.model("Page", pageSchema);
