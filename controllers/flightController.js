const Available_Flight = require('../models/Available_Flight');
const Profile = require('../models/Profile');

// ✅ Helper to get full user profile
async function getUserProfile(username) {
  if (!username) return null;
  return await Profile.findOne({
    $or: [{ username: username }, { email: username }]
  }).lean();
}

// ✅ Helper to check if admin
async function checkAdminPermission(username) {
  try {
    const user = await getUserProfile(username);
    return user && user.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin permission:', error);
    return false;
  }
}

const flightController = {
  // 📘 Get all flights
  getAllFlights: async (req, res) => {
    try {
      const username = req.query.user;
      const flights = await Available_Flight.find().sort({ departure_date: 1 }).lean();

      const profile = await getUserProfile(username);
      const isAdmin = profile?.isAdmin || false;

      res.render('manage-flights', {
        title: 'Manage Flights - DLSU Airlines',
        flights,
        isAdmin,
        username,
        profile
      });
    } catch (error) {
      console.error('Error fetching flights:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error retrieving flights'
      });
    }
  },

  // 📘 Show create flight form
  showCreateForm: async (req, res) => {
    try {
      const username = req.query.user;
      const profile = await getUserProfile(username);
      const isAdmin = profile?.isAdmin || false;

      if (!isAdmin) {
        return res.status(403).render('error', {
          title: 'Access Denied',
          message: 'Only administrators can create flights'
        });
      }

      res.render('create-flight', {
        title: 'Create Flight - DLSU Airlines',
        username,
        isAdmin,
        profile,
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
      const username = req.body.username;
      const profile = await getUserProfile(username);
      const isAdmin = profile?.isAdmin || false;

      if (!isAdmin) {
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

      // Basic validation
      if (!flightNumber || !origin || !destination || !departure_date || !arrival_date || !aircraftType || !seatCapacity) {
        return res.render('create-flight', {
          title: 'Create Flight - DLSU Airlines',
          username,
          isAdmin,
          profile,
          error: 'Please fill in all required fields',
          formData: req.body
        });
      }

      const newFlight = new Available_Flight({
        flightNumber,
        origin,
        destination,
        schedule: {
          departure_date: new Date(departure_date),
          departure_time,
          arrival_date: new Date(arrival_date),
          arrival_time
        },
        aircraftType,
        seatCapacity: parseInt(seatCapacity),
        airline,
        departure_date: new Date(departure_date),
        departure_time,
        arrival_date: new Date(arrival_date),
        arrival_time,
        price: parseFloat(price)
      });

  await newFlight.save();
  // console.log(`✅ Flight created: ${flightNumber} by admin ${username}`);

      res.redirect(`/admin/flights?user=${encodeURIComponent(username)}&message=Flight created successfully`);
    } catch (error) {
      console.error('Error creating flight:', error);

      if (error.code === 11000) {
        return res.render('create-flight', {
          title: 'Create Flight - DLSU Airlines',
          username: req.body.username,
          error: 'Flight number already exists',
          formData: req.body
        });
      }

      res.render('create-flight', {
        title: 'Create Flight - DLSU Airlines',
        username: req.body.username,
        error: 'Error creating flight: ' + error.message,
        formData: req.body
      });
    }
  },

  // 📘 Show edit form
  showEditForm: async (req, res) => {
    try {
      const username = req.query.user;
      const flightId = req.params.id;
      const profile = await getUserProfile(username);
      const isAdmin = profile?.isAdmin || false;

      if (!isAdmin) {
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
        username,
        isAdmin,
        profile,
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
      const username = req.body.username;
      const flightId = req.params.id;
      const profile = await getUserProfile(username);
      const isAdmin = profile?.isAdmin || false;

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can update flights'
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

      const updatedFlight = await Available_Flight.findByIdAndUpdate(
        flightId,
        {
          flightNumber,
          origin,
          destination,
          schedule: {
            departure_date: new Date(departure_date),
            departure_time,
            arrival_date: new Date(arrival_date),
            arrival_time
          },
          aircraftType,
          seatCapacity: parseInt(seatCapacity),
          airline,
          departure_date: new Date(departure_date),
          departure_time,
          arrival_date: new Date(arrival_date),
          arrival_time,
          price: parseFloat(price)
        },
        { new: true, runValidators: true }
      );

      if (!updatedFlight) {
        return res.status(404).render('error', {
          title: 'Not Found',
          message: 'Flight not found'
        });
      }

  // console.log(`✅ Flight updated: ${flightNumber} by admin ${username}`);
      res.redirect(`/admin/flights?user=${encodeURIComponent(username)}&message=Flight updated successfully`);
    } catch (error) {
      console.error('Error updating flight:', error);
      res.render('edit-flight', {
        title: 'Edit Flight - DLSU Airlines',
        username: req.body.username,
        flight: req.body,
        error: 'Error updating flight: ' + error.message
      });
    }
  },

  // 📘 Delete flight
  deleteFlight: async (req, res) => {
    try {
      const username = req.body.username || req.query.user;
      const profile = await getUserProfile(username);
      const isAdmin = profile?.isAdmin || false;

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can delete flights'
        });
      }

      const flightId = req.params.id;
      const deletedFlight = await Available_Flight.findByIdAndDelete(flightId);

      if (!deletedFlight) {
        return res.status(404).json({
          success: false,
          message: 'Flight not found'
        });
      }

  // console.log(`🗑️ Flight deleted: ${deletedFlight.flightNumber} by admin ${username}`);
      res.json({
        success: true,
        message: 'Flight deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting flight:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting flight'
      });
    }
  }
};

module.exports = flightController;
