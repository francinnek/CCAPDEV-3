// controllers/bookingController.js
const Booking = require('../models/Booking');
const userRoleAuth = require('../userAuth-middleware/userRoleAuth');

// Render bookings page
exports.renderBookingsPage = async (req, res) => {
  try {
    const username = req.session.user.username;
    if (!username) {
      console.log(`❌ Unauthorized bookings page access attempt by guest.`);
      return res.redirect('/loginOrRegister/login?error=Please login first');
    };

    const bookings = await Booking.find().lean();
    res.render('bookings', { title: 'My Bookings', bookings, username: username });
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
    const username = req.session.user.username;
    if (!username) {
      console.log(`❌ Unauthorized bookings page access attempt by guest.`);
      return res.redirect('/loginOrRegister/login?error=Please login first');
    };

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
    const username = req.session.user.username;
    if (!username) {
      console.log(`❌ Unauthorized bookings page access attempt by guest.`);
      return res.redirect('/loginOrRegister/login?error=Please login first');
    };
    
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (err) {
    res.status(400).json({ error: 'Invalid booking ID' });
  }
};

exports.userRoleAuth = userRoleAuth;
