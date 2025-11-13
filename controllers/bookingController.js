// controllers/bookingController.js
const Booking = require('../models/Booking');

// Render bookings page
exports.renderBookingsPage = async (req, res) => {
  try {
    const bookings = await Booking.find().lean();
    res.render('bookings', { title: 'My Bookings', bookings });
  } catch (err) {
    console.error('Error rendering bookings:', err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading bookings. Please try again.'
    });
  }
};

// GET /api/bookings - return all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().lean();
    res.status(200).json(bookings);
  } catch (err) {
    console.error('Error loading bookings:', err);
    res.status(500).json({ message: 'Error loading bookings. Please try again.' });
  }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (err) {
    res.status(400).json({ error: 'Invalid booking ID' });
  }
};
