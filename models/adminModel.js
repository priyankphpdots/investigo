const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const validator = require("validator");
const createError = require('http-errors');

const adminSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("email is invalid")
            }
        }
    },
    password: String,
    image: String,
    phone: String,
    address: String,
    facebook: String,
    linkedin: String,
    twitter: String,
    instagram: String
})

// generating tokens
adminSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY, { expiresIn: '90d' });
        return token;
    } catch (error) {
        createError.BadRequest(error);
        console.log("error: " + error);
    }
}

// converting password into hash
adminSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})

module.exports = new mongoose.model("Admin", adminSchema);