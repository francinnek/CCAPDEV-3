// controllers/checkinController.js
const Booking = require('../models/Booking');

function generateBoardingPass() {
    let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let numbers = "0123456789";
    let code = "";

    // Add first 2 letters
    for (let i = 0; i < 2; i++) {
        let randomIndex = Math.floor(Math.random() * 10);
        code += letters[randomIndex];
    }

    // Add 8 numbers
    for (let i = 0; i < 8; i++) {
        let randomIndex = Math.floor(Math.random() * numbers.length);
        code += numbers[randomIndex];
        //Math.random() generates a random decimal number between 0 (inclusive) and 1 (exclusive).
        //Math.random() * 10 → random decimal between 0 and 9.9999
        //Math.floor(x) rounds down to the nearest integer.
        //
    }
      

    return code;
}

//Logic: Simply loads the page with default values
//This function renders the check-in page when a user navigates to it.
exports.showCheckInPage = (req, res) => {
  res.render('checkin', {
    title: 'Online Check-in - DLSU Airlines',
    error: null,
    success: false
  });
};

//This handles the form submission when a user enters their booking reference and last name.
exports.processCheckIn = async (req, res) => {
  try {
    const { bookingId, lastName } = req.body;
     

    //Step 1: Basic validation, Checks if both fields are filled.
    //If validation fails → reload page with an error message.
    if (!bookingId || !lastName?.trim()) {
      return res.render('checkin', {
        title: 'Online Check-in',
        error: 'Please fill in both fields',
        success: false
      });
    }

    // Find booking using MongoDB _id (this IS the Booking Reference number)
    //ooks up the booking in MongoDB using bookingId.
    const booking = await Booking.findById(bookingId)
      .populate('flightId') // get flight details
      .lean(); //returns a plain JS object instead of a Mongoose document (better performance).

    if (!booking) {
      return res.render('checkin', {
        title: 'Online Check-in',
        error: 'Booking not found. Check your reference number.',
        success: false
      });
    }
    
    //Step 4: Verify last name
    // Extract last name (e.g., "Juan Dela Cruz" → "Cruz")
    const bookedLastName = booking.name.trim().split(' ').pop().toLowerCase();
    //split(' ') splits the string into an array of words using the space ' ' as the separator.
    //Example: "Juan Dela Cruz".split(' ') → ['Juan', 'Dela', 'Cruz']

    //pop() removes and returns the last element of the array.
    //Example: ['Juan', 'Dela', 'Cruz'].pop() → 'Cruz'

    //ooking.name.trim().split(' ').pop() → gets the last word from the full name.
    if (bookedLastName !== lastName.trim().toLowerCase()) {
      return res.render('checkin', {
        title: 'Online Check-in',
        error: 'Last name does not match this booking',
        success: false
      });
    }

    // Already checked in?
    if (booking.isCheckedIn) {
      return res.render('checkin', {
        title: 'Already Checked In',
        success: true,
        boardingPass: booking.boardingPassNumber,
        booking: booking
      });
    }

    // Generate boarding pass number
    const boardingPass = generateBoardingPass();

    // Save check-in info
    await Booking.findByIdAndUpdate(bookingId, {
        isCheckedIn: true,
        boardingPassNumber: boardingPass,
        status: 'checked-in',           
    });

    // Reload with updated data
    const updatedBooking = await Booking.findById(bookingId).populate('flightId').lean();

    res.render('checkin', {
      title: 'Check-in Complete!',
      success: true,
      boardingPass: boardingPass,
      booking: updatedBooking
    });

  } catch (err) {
    console.error('Check-in error:', err);
    res.render('checkin', {
      title: 'Error',
      error: 'Something went wrong. Please try again later.',
      success: false
    });
  }
};