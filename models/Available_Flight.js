const mongoose = require('mongoose');

const availableFlightSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        unique: true
    },
    origin: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    schedule: {
        departure_date: {
            type: Date,
            required: true
        },
        departure_time: {
            type: String,
            required: true
        },
        arrival_date: {
            type: Date,
            required: true
        },
        arrival_time: {
            type: String,
            required: true
        }
    },
    aircraftType: {
        type: String,
        required: true
    },
    seatCapacity: {
        type: Number,
        required: true,
        min: 1
    },
    airline: {
        type: String,
        required: true
    },
    departure_date: {
        type: Date,
        required: true
    },
    departure_time: {
        type: String,
        required: true
    },
    arrival_date: {
        type: Date,
        required: true
    },
    arrival_time: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Available_Flight', availableFlightSchema);