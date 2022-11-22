const mongoose = require('mongoose');
const validator = require("validator");

const messageSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: [true, 'validation.fname'],
    },
    lname: {
        type: String,
        required: [true, 'validation.lname'],
    },
    email: {
        type: String,
        required: [true, 'validation.email'],
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("validation.emailInvalid")
            }
        }
    },
    phone: {
        type: String,
        required: [true, 'validation.phone'],
    },
    subject: {
        type: String,
        required: [true, 'validation.subject'],
    },
    message: {
        type: String,
        required: [true, 'validation.message'],
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

// pre validate trim value
messageSchema.pre('validate', function (next) {
    if (this.fname) {
        this.fname = this.fname.trim();
    }
    if (this.lname) {
        this.lname = this.lname.trim();
    }
    if (this.phone) {
        this.phone = this.phone.trim();
    }
    if (this.subject) {
        this.subject = this.subject.trim();
    }
    if (this.message) {
        this.message = this.message.trim();
    }
    next();
});

module.exports = new mongoose.model("Message", messageSchema);