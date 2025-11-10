const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Get bookings page
router.get('/bookings', bookingController.renderBookingsPage);

// API Routes
router.get('/api/bookings', bookingController.getAllBookings);
router.get('/api/bookings/:id', bookingController.getBookingById);

module.exports = router;
