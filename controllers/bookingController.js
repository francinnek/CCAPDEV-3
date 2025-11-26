// controllers/bookingController.js
const Booking = require('../models/Booking');
const validation = require('../utils/validation');
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
    
    // Validate MongoDB ID
    const idValidation = validation.validateMongoId(req.params.id);
    if (!idValidation.isValid) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }
    
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify user can only access their own bookings
    if (booking.username !== username) {
      return res.status(403).json({ error: 'Unauthorized access to this booking' });
    }

    res.status(200).json(booking);
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(400).json({ error: 'Invalid booking ID' });
  }
};

exports.userRoleAuth = userRoleAuth;

// validate booking data for creating/updating
exports.validateBookingData = function(data) {
  const errors = [];

  // Validate passenger name
  const nameValidation = validation.validateFullName(data.name);
  if (!nameValidation.isValid) errors.push(nameValidation.error);

  // Validate email
  const emailValidation = validation.validateEmail(data.email);
  if (!emailValidation.isValid) errors.push(emailValidation.error);

  // Validate passport ID
  const passportValidation = validation.validatePassportId(data.passportId);
  if (!passportValidation.isValid) errors.push(passportValidation.error);

  // Validate seat selection
  if (data.selectedSeat) {
    const seatValidation = validation.validateSeat(data.selectedSeat);
    if (!seatValidation.isValid) errors.push(seatValidation.error);
  }

  // Validate meal option
  if (data.mealOption) {
    const mealValidation = validation.validateMealOption(data.mealOption);
    if (!mealValidation.isValid) errors.push(mealValidation.error);
  }

  // Validate extra baggage
  const baggageValidation = validation.validateExtraBaggage(data.extraBaggage);
  if (!baggageValidation.isValid) errors.push(baggageValidation.error);

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// validate booking update data
exports.validateBookingUpdate = function(data) {
  const errors = [];

  // Validate seat selection
  if (data.selectedSeat) {
    const seatValidation = validation.validateSeat(data.selectedSeat);
    if (!seatValidation.isValid) errors.push(seatValidation.error);
  }

  // Validate meal option
  if (data.mealOption) {
    const mealValidation = validation.validateMealOption(data.mealOption);
    if (!mealValidation.isValid) errors.push(mealValidation.error);
  }

  // Validate extra baggage
  const baggageValidation = validation.validateExtraBaggage(data.extraBaggage);
  if (!baggageValidation.isValid) errors.push(baggageValidation.error);

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};
