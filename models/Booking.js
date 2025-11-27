const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    passportId: {
        type: String,
        required: true
    },
    flightId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Available_Flight'
    },
    selectedSeat: {
        type: String,
        required: true
    },
    mealOption: {
        type: String,
        default: 'Standard'
    },
    extraBaggage: {
        type: Number,
        default: 0
    },
    origin: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    airline: String,
    flightDeparture: String,
    flightArrival: String,
    flightPrice: Number,
    baggagePrice: Number,
    totalPrice: Number,
    status: {
        type: String,
        default: 'confirmed'
    },
    isCheckedIn: {
        type: Boolean,
        default: false
    },

    boardingPassNumber: {
        type: String,
        unique: true
    },
 

}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);