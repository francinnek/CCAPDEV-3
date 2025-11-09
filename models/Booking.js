const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
    selectedSeat: {
        type: String,
        required: true
    },
    mealOption: {
        type: String,
        default: 'Standard'
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
    price: Number,
    status: {
        type: String,
        default: 'confirmed'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);