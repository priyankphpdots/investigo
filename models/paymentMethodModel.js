const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    card: {
        type: String,
        required: [true, "validation.cardNum"]
    },
    network: {
        type: String,
        required: [true, "validation.cardNetwork"]
    },
    expiry: {
        type: String,
        required: [true, "validation.cardExpiry"]
    }
});

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);