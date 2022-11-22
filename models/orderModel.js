const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    package: {
        type: mongoose.Schema.ObjectId,
        ref: 'Package',
        required: [true, 'Order must have a package']
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: [true, 'Order must have a project']
    },
    orderDate: {
        type: Date,
        default: Date.now()
    },
    orderId: {
        type: String,
        required: [true, 'Please provide orderId.'],
        unique: true
    },
    withdrawn: {
        type: Boolean,
        default: false
    },
    withdraw: {
        type: mongoose.Schema.ObjectId,
        ref: 'Withdraw',
    },
    endDate: Date,
    paymentType: String,
    amount: Number,
    returnAmount: Number,
    term: {
        type: Number,
        default: 1,
    },
    paymentId: String,
});

module.exports = new mongoose.model("Order", orderSchema);