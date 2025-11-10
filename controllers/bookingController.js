// controllers/bookingController.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// GET /bookings/:id - Get single booking details
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).lean();
        if (booking) {
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (err) {
        res.status(400).json({ error: 'Invalid booking ID' });
    }
});

// POST /bookings - Create new booking
router.post('/', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /bookings/reservations/:id/cancel - Cancel booking
router.post('/reservations/:id/cancel', async (req, res) => {
    try {
        await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error cancelling booking' });
    }
});

module.exports = router;