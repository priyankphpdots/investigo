const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
    en: {
        name: String,
    },
    fr: {
        name: String,
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
    },
    forBenefits: {
        type: Boolean,
        default: false,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

module.exports = new mongoose.model("Update", updateSchema);