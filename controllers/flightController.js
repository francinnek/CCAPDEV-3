const Available_Flight = require('../models/Available_Flight');
const Profile = require('../models/Profile');
const validation = require('../utils/validation');

/* ✅ Helper to get full user profile
// async function getUserProfile(req) {
//   if (!req.session.user) return null;
//   return req.session.user; // Session already has the user data
  
//   // if (!req.session.user) return null;
//   // return await Profile.findOne({
//   //   $or: [{ username: req.session.user.username }, { email: req.session.user.username }]
//   // }).lean();

//   // if (!username) return null;
//   // return await Profile.findOne({
//   //   $or: [{ username: username }, { email: username }]
//   // }).lean();
// }

// ✅ Helper to check if admin
// async function checkAdminPermission(username) {
//   try {
//     const user = await getUserProfile(username);
//     return user && user.isAdmin === true;
//   } catch (error) {
//     console.error('Error checking admin permission:', error);
//     return false;
//   }
// }*/

const flightController = {
  // 📘 Get all flights
  getAllFlights: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/loginOrRegister/login?error=Please login first');
      };

      const username = req.session.user.username;
      const flights = await Available_Flight.find().sort({ departure_date: 1 }).lean();
      // const profile = await getUserProfile(username);
      const profile = req.session.user; // await getUserProfile(username);
      const isAdmin = req.session.user.isAdmin || false;
      // const isAdmin = profile?.isAdmin || false;

      res.render('manage-flights', {
        title: 'Manage Flights - DLSU Airlines',
        flights,
        isAdmin,
        username: username,
        profile
      });
      console.log(`✅ Successfully fetched all flights.`);

    } catch (error) {
      console.error('❌ Error fetching flights:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error retrieving flights'
      });
    }
  },

  // 📘 Show create flight form
  showCreateForm: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/loginOrRegister/login?error=Please login first');
      };
      // const username = req.query.user;
      const username = req.session.user.username;
      const profile = req.session.user; // await getUserProfile(username);
      // const isAdmin = profile?.isAdmin || false;
      const isAdmin = req.session.user.isAdmin || false;

      if (!isAdmin || !profile) {
        return res.status(403).render('error', {
          title: 'Access Denied',
          message: 'Only administrators can create flights'
        });
      }

      res.render('create-flight', {
        title: 'Create Flight - DLSU Airlines',
        username: username,
        isAdmin: isAdmin,
        profile: profile,
        error: null,
        formData: {}
      });
      
    } catch (error) {
      console.error('Error showing create form:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Server error'
      });
    }
  },

  // 📘 Create flight
  createFlight: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/loginOrRegister/login?error=Please login first');
      };

      const username = req.session.user.username;
      const profile = req.session.user;
      const isAdmin = req.session.user.isAdmin || false;

      if (!isAdmin || !profile) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can create flights'
        });
      }

      const {
        flightNumber,
        origin,
        destination,
        departure_date,
        departure_time,
        arrival_date,
        arrival_time,
        aircraftType,
        seatCapacity,
        airline,
        price
      } = req.body;

      //SERVER-SIDE VALIDATION uses the validation.js 
      const errors = [];

      // Validate flight number
      const flightNumValidation = validation.validateFlightNumber(flightNumber);
      if (!flightNumValidation.isValid) errors.push(flightNumValidation.error);

      // Validate airport codes
      const originValidation = validation.validateAirportCode(origin);
      if (!originValidation.isValid) errors.push('Origin: ' + originValidation.error);

      const destinationValidation = validation.validateAirportCode(destination);
      if (!destinationValidation.isValid) errors.push('Destination: ' + destinationValidation.error);

      // Check that origin and destination are different
      if (originValidation.isValid && destinationValidation.isValid &&
          originValidation.sanitized === destinationValidation.sanitized) {
        errors.push('Origin and destination cannot be the same');
      }

      // Validate departure date and time
      const departureValidation = validation.validateDateTime(departure_date, departure_time);
      if (!departureValidation.isValid) errors.push('Departure: ' + departureValidation.error);

      // Validate arrival date and time
      const arrivalValidation = validation.validateDateTime(arrival_date, arrival_time);
      if (!arrivalValidation.isValid) errors.push('Arrival: ' + arrivalValidation.error);

      // Validate seat capacity
      const capacityValidation = validation.validateSeatCapacity(seatCapacity);
      if (!capacityValidation.isValid) errors.push(capacityValidation.error);

      // Validate price
      const priceValidation = validation.validatePrice(price);
      if (!priceValidation.isValid) errors.push(priceValidation.error);

      // Validate aircraft type
      const aircraftValidation = validation.validateTextField(aircraftType, 'Aircraft type', 2, 50);
      if (!aircraftValidation.isValid) errors.push(aircraftValidation.error);

      // Validate airline
      let airlineValidation = { isValid: true, sanitized: airline };
      if (airline) {
        airlineValidation = validation.validateTextField(airline, 'Airline', 2, 50);
        if (!airlineValidation.isValid) errors.push(airlineValidation.error);
      }

      // Check arrival is after departure
      if (departureValidation.isValid && arrivalValidation.isValid) {
        const depDateTime = new Date(`${departure_date}T${departure_time}`);
        const arrDateTime = new Date(`${arrival_date}T${arrival_time}`);
        if (arrDateTime <= depDateTime) {
          errors.push('Arrival time must be after departure time');
        }
      }

      if (errors.length > 0) {
        return res.render('create-flight', {
          title: 'Create Flight - DLSU Airlines',
          username: username,
          isAdmin: isAdmin,
          profile: profile,
          error: errors.join(', '),
          formData: req.body
        });
      }

      const newFlight = new Available_Flight({
        flightNumber: flightNumValidation.sanitized,
        origin: originValidation.sanitized,
        destination: destinationValidation.sanitized,
        schedule: {
          departure_date: new Date(departure_date),
          departure_time,
          arrival_date: new Date(arrival_date),
          arrival_time
        },
        aircraftType: aircraftValidation.sanitized,
        seatCapacity: capacityValidation.sanitized,
        airline: airlineValidation.sanitized || 'Not Specified',
        departure_date: new Date(departure_date),
        departure_time,
        arrival_date: new Date(arrival_date),
        arrival_time,
        price: parseFloat(priceValidation.sanitized)
      });

      await newFlight.save();
      console.log(`✅ Flight created successfully: ${flightNumValidation.sanitized}`);

      res.redirect(`/admin/flights?user=${encodeURIComponent(username)}&message=Flight created successfully`);
    } catch (error) {
      console.error('❌ Error creating flight:', error);

      if (error.code === 11000) {
        return res.render('create-flight', {
          title: 'Create Flight - DLSU Airlines',
          username: req.session.user.username,
          error: 'Flight number already exists',
          formData: req.body
        });
      }

      res.render('create-flight', {
        title: 'Create Flight - DLSU Airlines',
        username: req.session.user.username,
        error: '❌ Error creating flight: ' + error.message,
        formData: req.body
      });
    }
  },

  // 📘 Show edit form
  showEditForm: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/loginOrRegister/login?error=Please login first');
      };

      // const username = req.query.user;
      const username = req.session.user.username;
      const flightId = req.params.id;
      const profile = req.session.user; // await getUserProfile(username);
      // const isAdmin = profile?.isAdmin || false;
      const isAdmin = req.session.user.isAdmin || false;

      if (!isAdmin || !profile) {
        return res.status(403).render('error', {
          title: 'Access Denied',
          message: 'Only administrators can edit flights'
        });
      }

      const flight = await Available_Flight.findById(flightId).lean();
      if (!flight) {
        return res.status(404).render('error', {
          title: 'Not Found',
          message: 'Flight not found'
        });
      }

      res.render('edit-flight', {
        title: 'Edit Flight - DLSU Airlines',
        username: username,
        isAdmin: isAdmin,
        profile: profile,
        flight,
        error: null
      });
    } catch (error) {
      console.error('Error showing edit form:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Server error'
      });
    }
  },

  // 📘 Update flight
  updateFlight: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/loginOrRegister/login?error=Please login first');
      };

      const username = req.session.user.username;
      const flightId = req.params.id;
      const profile = req.session.user;
      const isAdmin = req.session.user.isAdmin || false;

      if (!isAdmin || !profile) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can update flights'
        });
      }

      // Validate MongoDB ID
      const idValidation = validation.validateMongoId(flightId);
      if (!idValidation.isValid) {
        return res.status(400).render('error', {
          title: 'Error',
          message: 'Invalid flight ID'
        });
      }

      const {
        flightNumber,
        origin,
        destination,
        departure_date,
        departure_time,
        arrival_date,
        arrival_time,
        aircraftType,
        seatCapacity,
        airline,
        price
      } = req.body;

      // SERVER-SIDE VALIDATION uses the validation.js
      const errors = [];

      const flightNumValidation = validation.validateFlightNumber(flightNumber);
      if (!flightNumValidation.isValid) errors.push(flightNumValidation.error);

      const originValidation = validation.validateAirportCode(origin);
      if (!originValidation.isValid) errors.push('Origin: ' + originValidation.error);

      const destinationValidation = validation.validateAirportCode(destination);
      if (!destinationValidation.isValid) errors.push('Destination: ' + destinationValidation.error);

      if (originValidation.isValid && destinationValidation.isValid &&
          originValidation.sanitized === destinationValidation.sanitized) {
        errors.push('Origin and destination cannot be the same');
      }

      const departureValidation = validation.validateDateTime(departure_date, departure_time);
      if (!departureValidation.isValid) errors.push('Departure: ' + departureValidation.error);

      const arrivalValidation = validation.validateDateTime(arrival_date, arrival_time);
      if (!arrivalValidation.isValid) errors.push('Arrival: ' + arrivalValidation.error);

      const capacityValidation = validation.validateSeatCapacity(seatCapacity);
      if (!capacityValidation.isValid) errors.push(capacityValidation.error);

      const priceValidation = validation.validatePrice(price);
      if (!priceValidation.isValid) errors.push(priceValidation.error);

      const aircraftValidation = validation.validateTextField(aircraftType, 'Aircraft type', 2, 50);
      if (!aircraftValidation.isValid) errors.push(aircraftValidation.error);

      let airlineValidation = { isValid: true, sanitized: airline };
      if (airline) {
        airlineValidation = validation.validateTextField(airline, 'Airline', 2, 50);
        if (!airlineValidation.isValid) errors.push(airlineValidation.error);
      }

      if (departureValidation.isValid && arrivalValidation.isValid) {
        const depDateTime = new Date(`${departure_date}T${departure_time}`);
        const arrDateTime = new Date(`${arrival_date}T${arrival_time}`);
        if (arrDateTime <= depDateTime) {
          errors.push('Arrival time must be after departure time');
        }
      }

      if (errors.length > 0) {
        const flight = await Available_Flight.findById(flightId).lean();
        return res.render('edit-flight', {
          title: 'Edit Flight - DLSU Airlines',
          username: username,
          isAdmin: isAdmin,
          profile: profile,
          flight: flight,
          error: errors.join(', ')
        });
      }

      const updatedFlight = await Available_Flight.findByIdAndUpdate(
        flightId,
        {
          flightNumber: flightNumValidation.sanitized,
          origin: originValidation.sanitized,
          destination: destinationValidation.sanitized,
          schedule: {
            departure_date: new Date(departure_date),
            departure_time,
            arrival_date: new Date(arrival_date),
            arrival_time
          },
          aircraftType: aircraftValidation.sanitized,
          seatCapacity: capacityValidation.sanitized,
          airline: airlineValidation.sanitized || 'Not Specified',
          departure_date: new Date(departure_date),
          departure_time,
          arrival_date: new Date(arrival_date),
          arrival_time,
          price: parseFloat(priceValidation.sanitized)
        },
        { new: true, runValidators: true }
      );

      if (!updatedFlight) {
        return res.status(404).render('error', {
          title: 'Not Found',
          message: 'Flight not found'
        });
      }

      console.log(`✅ Flight updated successfully: ${flightNumValidation.sanitized}`);
      res.redirect(`/admin/flights?user=${encodeURIComponent(username)}&message=Flight updated successfully`);
    } catch (error) {
      console.error('❌ Error updating flight:', error);
      const flight = await Available_Flight.findById(req.params.id).lean();
      res.render('edit-flight', {
        title: 'Edit Flight - DLSU Airlines',
        username: req.session.user.username,
        flight: flight,
        error: 'Error updating flight: ' + error.message
      });
    }
  },

  // 📘 Delete flight
  deleteFlight: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/loginOrRegister/login?error=Please login first');
      };

      const profile = req.session.user;
      const isAdmin = req.session.user.isAdmin || false;

      if (!isAdmin || !profile) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can delete flights'
        });
      }

      const flightId = req.params.id;

      // Validate MongoDB ID
      const idValidation = validation.validateMongoId(flightId);
      if (!idValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid flight ID'
        });
      }

      const deletedFlight = await Available_Flight.findByIdAndDelete(flightId);

      if (!deletedFlight) {
        return res.status(404).json({
          success: false,
          message: 'Flight not found'
        });
      }

      console.log(`✅ Flight deleted successfully: ${deletedFlight.flightNumber}`);
      res.json({
        success: true,
        message: 'Flight deleted successfully'
      });
    } catch (error) {
      console.error('❌ Error deleting flight:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting flight'
      });
    }
  }
};

module.exports = flightController;
