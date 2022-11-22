const mongoose = require('mongoose');

//Contact schema
const ContactSchema = mongoose.Schema({
    phone: {
        type: String,
    },
    email: {
        type: String,
    },
    address: {
        type: String,
    }
});

module.exports = mongoose.model('Contact', ContactSchema);