const mongoose = require('mongoose');
const validator = require("validator");

const applicationSchema = new mongoose.Schema({
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
    resume: String,
    date: {
        type: Date,
        default: Date.now()
    }
})

// pre validate trim value
applicationSchema.pre('validate', function (next) {
    if (this.fname) {
        this.fname = this.fname.trim();
    }
    if (this.lname) {
        this.lname = this.lname.trim();
    }
    if (this.phone) {
        this.phone = this.phone.trim();
    }
    next();
});

module.exports = new mongoose.model("application", applicationSchema);